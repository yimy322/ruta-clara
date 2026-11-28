-- RutaClara · 007 · Reporte con tus palabras (Fase 7, IA gratuita con Gemini).
-- Límite de usos de la IA por usuario y día, para cuidar la cuota gratuita.
-- Ejecutar después de 006. Se puede volver a correr.

create table if not exists public.uso_ia (
  usuario_id uuid not null references auth.users (id) on delete cascade,
  dia date not null,
  usos int not null default 0,
  primary key (usuario_id, dia)
);

-- RLS sin políticas: nadie la lee ni la escribe directo, solo la función
alter table public.uso_ia enable row level security;

-- Suma un uso del día (hora de Lima) al usuario de la sesión. Devuelve false
-- si ya llegó al límite (y entonces no suma).
create or replace function public.registrar_uso_ia(limite int default 30)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  hoy date := (now() at time zone 'America/Lima')::date;
  actuales int;
begin
  if uid is null then
    return false;
  end if;
  insert into public.uso_ia (usuario_id, dia, usos)
  values (uid, hoy, 0)
  on conflict (usuario_id, dia) do nothing;

  update public.uso_ia
  set usos = usos + 1
  where usuario_id = uid and dia = hoy and usos < limite
  returning usos into actuales;

  return actuales is not null;
end;
$$;

revoke execute on function public.registrar_uso_ia(int) from public, anon;
grant execute on function public.registrar_uso_ia(int) to authenticated;
