-- RutaClara · 003 · Funciones: perfil al registrarse, crear_reporte y
-- refrescar_demo. Ejecutar después de 002. Se puede volver a correr.

-- Inicio del día y «ayer a las HH:MM» en hora de Lima
create or replace function public.lima_ayer_a_las(hora time)
returns timestamptz
language sql stable
set search_path = ''
as $$
  select (((now() at time zone 'America/Lima')::date - 1) + hora) at time zone 'America/Lima';
$$;

-- Perfil + datos de demo para cada cuenta nueva, para que se vea como en
-- Figma (decisión 54): paraderos favoritos, lugares y avisos de mocks/.
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  inicio_hoy timestamptz := date_trunc('day', now() at time zone 'America/Lima') at time zone 'America/Lima';
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', ''))
  on conflict (id) do nothing;

  insert into public.paraderos_favoritos (usuario_id, paradero_id)
  values (new.id, 'puente-nuevo'), (new.id, 'angamos')
  on conflict do nothing;

  insert into public.lugares (usuario_id, nombre, direccion, lat, lng)
  values
    (new.id, 'Casa', 'Av. Nicolás Ayllón 1520, El Agustino', -12.0441, -76.9979),
    (new.id, 'Trabajo', 'Av. Javier Prado Este 4200, Surco', -12.0853, -76.9768),
    (new.id, 'U', 'Av. Javier Prado Este 4600, Surco', -12.0847, -76.9712)
  on conflict do nothing;

  insert into public.notificaciones (usuario_id, tipo, titulo, detalle, fecha, leida, linea_id, paradero_id)
  values
    (new.id, 'desvio', 'La ruta 50 está desviada por Av. Brasil', 'Reportado por 9 pasajeros',
      greatest(now() - interval '14 minutes', inicio_hoy), false, 'la-50', null),
    (new.id, 'transito', 'Tráfico intenso en Puente Nuevo', 'Sal 10 min antes',
      greatest(now() - interval '32 minutes', inicio_hoy), true, null, 'puente-nuevo'),
    (new.id, 'seguridad', 'Alerta de seguridad en Paradero Angamos', 'Robo reportado',
      public.lima_ayer_a_las('19:12'), true, null, 'angamos'),
    (new.id, 'logro', 'Subiste a Cazador de Combis', '+100 pts de bonificación',
      public.lima_ayer_a_las('18:20'), true, null, null);

  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- Guarda un reporte del usuario y le suma los puntos (5.4).
-- Puntos: copia de PUNTOS_POR_TIPO en src/config/gamificacion.ts
create or replace function public.crear_reporte(datos jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  usuario uuid := auth.uid();
  nuevo public.reportes;
  ganados int;
begin
  if usuario is null then
    raise exception 'Hay que iniciar sesión para reportar';
  end if;

  ganados := case datos ->> 'tipo'
    when 'ubicacion' then 15
    when 'paradero' then 10
    when 'transito' then 15
    when 'seguridad' then 10
    when 'valoracion' then 5
    when 'desvio' then 15
    else 0
  end;

  insert into public.reportes (
    tipo, usuario_id, linea_id, paradero_id, lat, lng, ocupacion, velocidad, nota, valoracion,
    etiquetas, espera, congestion, causas, via, seguridad, urgente, anonimo, foto_url
  )
  values (
    datos ->> 'tipo', usuario, datos ->> 'linea_id', datos ->> 'paradero_id',
    (datos ->> 'lat')::double precision, (datos ->> 'lng')::double precision,
    datos ->> 'ocupacion', datos ->> 'velocidad', datos ->> 'nota', (datos ->> 'valoracion')::int,
    (select array_agg(e) from jsonb_array_elements_text(datos -> 'etiquetas') e),
    datos ->> 'espera', datos ->> 'congestion',
    (select array_agg(c) from jsonb_array_elements_text(datos -> 'causas') c),
    datos ->> 'via', datos ->> 'seguridad',
    coalesce((datos ->> 'urgente')::boolean, false), coalesce((datos ->> 'anonimo')::boolean, false),
    datos ->> 'foto_url'
  )
  returning * into nuevo;

  update public.perfiles set puntos = puntos + ganados where id = usuario;

  return jsonb_build_object('reporte', to_jsonb(nuevo), 'puntos', ganados);
end;
$$;

revoke execute on function public.crear_reporte(jsonb) from public, anon;
grant execute on function public.crear_reporte(jsonb) to authenticated;

-- Vuelve a fechar los reportes de ejemplo como haceMin / ayerALas de
-- src/mocks/reportes.ts, para que la demo siga «en vivo». Solo toca filas
-- de ejemplo (demo_hace o demo_ayer). Devuelve cuántas actualizó.
create or replace function public.refrescar_demo()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  cantidad int;
begin
  update public.reportes
  set creado_en = coalesce(now() - demo_hace, public.lima_ayer_a_las(demo_ayer))
  where demo_hace is not null or demo_ayer is not null;
  get diagnostics cantidad = row_count;
  return cantidad;
end;
$$;

revoke execute on function public.refrescar_demo() from public;
grant execute on function public.refrescar_demo() to anon, authenticated;
