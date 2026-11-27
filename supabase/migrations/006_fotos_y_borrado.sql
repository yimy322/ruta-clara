-- RutaClara · 006 · Fotos de reportes (Storage) y borrado programado de
-- cuentas al vencer el periodo de gracia (pg_cron). Ejecutar después de 005.
-- Se puede volver a correr.

-- Fotos: bucket público para leer; cada usuario sube solo a su carpeta
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-reportes', 'fotos-reportes', true, 5242880, array['image/jpeg', 'image/png', 'image/heic'])
on conflict (id) do nothing;

drop policy if exists "Subir fotos a mi carpeta" on storage.objects;
create policy "Subir fotos a mi carpeta" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'fotos-reportes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
-- Sin políticas de update ni delete: nadie sobrescribe ni borra desde la app

-- Borrado programado (D5): al vencer eliminacion_el se borra la cuenta de
-- Auth. En cascada se van perfil, favoritos, lugares, alertas y avisos (002);
-- los reportes se conservan sin usuario (D2).
create extension if not exists pg_cron;

create or replace function public.borrar_cuentas_vencidas()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  cantidad int;
begin
  delete from auth.users
  where id in (select id from public.perfiles where eliminacion_el <= now());
  get diagnostics cantidad = row_count;
  return cantidad;
end;
$$;

revoke execute on function public.borrar_cuentas_vencidas() from public, anon, authenticated;

-- Todos los días a las 08:00 UTC (03:00 en Lima)
do $$
begin
  if exists (select 1 from cron.job where jobname = 'borrar-cuentas-vencidas') then
    perform cron.unschedule('borrar-cuentas-vencidas');
  end if;
end $$;

select cron.schedule('borrar-cuentas-vencidas', '0 8 * * *', 'select public.borrar_cuentas_vencidas()');
