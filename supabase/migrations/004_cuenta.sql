-- RutaClara · 004 · Cuenta (D1–D5): desactivar, reactivar y eliminación con
-- periodo de gracia. La app no puede escribir estas columnas directo (002),
-- solo por estas funciones y siempre sobre su propio perfil.

create or replace function public.desactivar_cuenta()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.perfiles set desactivada = true where id = auth.uid();
$$;

-- Se llama al iniciar sesión: «vuelves cuando quieras iniciando sesión» (D3)
create or replace function public.reactivar_cuenta()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.perfiles set desactivada = false where id = auth.uid() and desactivada;
$$;

-- 30 días = DIAS_GRACIA_ELIMINACION en src/config/cuenta.ts
create or replace function public.solicitar_eliminacion()
returns timestamptz
language sql
security definer
set search_path = ''
as $$
  update public.perfiles
  set eliminacion_el = now() + interval '30 days'
  where id = auth.uid()
  returning eliminacion_el;
$$;

create or replace function public.cancelar_eliminacion()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.perfiles set eliminacion_el = null where id = auth.uid();
$$;

do $$
declare
  funcion text;
begin
  foreach funcion in array array['desactivar_cuenta', 'reactivar_cuenta', 'solicitar_eliminacion', 'cancelar_eliminacion'] loop
    execute format('revoke execute on function public.%I() from public, anon', funcion);
    execute format('grant execute on function public.%I() to authenticated', funcion);
  end loop;
end $$;
