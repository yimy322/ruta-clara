-- RutaClara · 002 · Datos del usuario y reportes
-- Cada usuario ve y edita solo lo suyo. Ejecutar después de 001.

create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  telefono text,
  puntos int not null default 0,
  -- Fecha en que se borrará la cuenta; null si no se pidió eliminarla (D5)
  eliminacion_el timestamptz,
  desactivada boolean not null default false,
  creado_en timestamptz not null default now()
);

create table if not exists public.lineas_favoritas (
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  linea_id text not null references public.lineas (id) on delete cascade,
  primary key (usuario_id, linea_id)
);

create table if not exists public.paraderos_favoritos (
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  paradero_id text not null references public.paraderos (id) on delete cascade,
  primary key (usuario_id, paradero_id)
);

create table if not exists public.lugares (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null check (nombre in ('Casa', 'Trabajo', 'U')),
  direccion text not null,
  lat double precision not null,
  lng double precision not null,
  unique (usuario_id, nombre)
);

-- Alerta diaria (F3_03)
create table if not exists public.alertas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  linea_id text not null references public.lineas (id) on delete cascade,
  paradero_id text not null references public.paraderos (id) on delete cascade,
  destino_id text not null references public.destinos (id) on delete cascade,
  hora int not null check (hora between 0 and 23),
  minuto int not null check (minuto between 0 and 59),
  -- Como Date.getDay(): 0 = domingo … 6 = sábado
  dias int[] not null default '{}',
  minutos_antes int not null check (minutos_antes in (3, 5, 10)),
  transito boolean not null default true,
  seguridad boolean not null default true,
  activa boolean not null default true
);

-- Centro de notificaciones (F3_04)
create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('llegada', 'desvio', 'transito', 'seguridad', 'logro')),
  titulo text not null,
  detalle text not null,
  fecha timestamptz not null default now(),
  leida boolean not null default false,
  linea_id text references public.lineas (id) on delete set null,
  paradero_id text references public.paraderos (id) on delete set null,
  alerta_id uuid references public.alertas (id) on delete set null
);

-- Reportes colaborativos. Solo se insertan con la RPC crear_reporte (003).
-- Si se borra la cuenta, el reporte se conserva sin usuario (D2).
create table if not exists public.reportes (
  id text primary key default gen_random_uuid()::text,
  tipo text not null check (tipo in ('ubicacion', 'paradero', 'transito', 'seguridad', 'desvio', 'valoracion')),
  usuario_id uuid references auth.users (id) on delete set null,
  linea_id text references public.lineas (id) on delete set null,
  paradero_id text references public.paraderos (id) on delete set null,
  lat double precision not null,
  lng double precision not null,
  ocupacion text check (ocupacion in ('sentados', 'lleno', 'sopa')),
  velocidad text check (velocidad in ('normal', 'lento', 'chanteando')),
  nota text,
  valoracion int check (valoracion between 1 and 5),
  etiquetas text[],
  espera text check (espera in ('5_10', '15_20', 'mas_30')),
  congestion text check (congestion in ('fluido', 'moderado', 'pesado', 'trancadera')),
  causas text[],
  via text,
  seguridad text check (seguridad in ('paradero_peligroso', 'robo', 'acoso', 'conductor_imprudente')),
  urgente boolean not null default false,
  anonimo boolean not null default false,
  foto_url text,
  creado_en timestamptz not null default now(),
  confirmaciones int not null default 1,
  -- Solo en los reportes de ejemplo: refrescar_demo() los vuelve a fechar
  demo_hace interval,
  demo_ayer time
);

create index if not exists reportes_creado_en_idx on public.reportes (creado_en desc);
create index if not exists reportes_usuario_idx on public.reportes (usuario_id);

-- RLS
alter table public.perfiles enable row level security;
alter table public.lineas_favoritas enable row level security;
alter table public.paraderos_favoritos enable row level security;
alter table public.lugares enable row level security;
alter table public.alertas enable row level security;
alter table public.notificaciones enable row level security;
alter table public.reportes enable row level security;

drop policy if exists "Ver mi perfil" on public.perfiles;
create policy "Ver mi perfil" on public.perfiles
  for select to authenticated using (id = (select auth.uid()));
drop policy if exists "Editar mi perfil" on public.perfiles;
create policy "Editar mi perfil" on public.perfiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- Los puntos y la eliminación los cambian las funciones de 003, no la app
grant select on public.perfiles to authenticated;
revoke update on public.perfiles from authenticated;
grant update (nombre, telefono) on public.perfiles to authenticated;

-- Tablas donde el usuario hace todo sobre sus filas
do $$
declare
  tabla text;
begin
  foreach tabla in array array['lineas_favoritas', 'paraderos_favoritos', 'lugares', 'alertas'] loop
    execute format('drop policy if exists "Lo mío" on public.%I', tabla);
    execute format(
      'create policy "Lo mío" on public.%I for all to authenticated using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()))',
      tabla
    );
    execute format('grant select, insert, update, delete on public.%I to authenticated', tabla);
  end loop;
end $$;

drop policy if exists "Ver mis avisos" on public.notificaciones;
create policy "Ver mis avisos" on public.notificaciones
  for select to authenticated using (usuario_id = (select auth.uid()));
drop policy if exists "Marcar mis avisos" on public.notificaciones;
create policy "Marcar mis avisos" on public.notificaciones
  for update to authenticated using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
-- Por ahora la app crea avisos propios («Simular aviso de alerta»)
drop policy if exists "Crear mis avisos" on public.notificaciones;
create policy "Crear mis avisos" on public.notificaciones
  for insert to authenticated with check (usuario_id = (select auth.uid()));
grant select, insert on public.notificaciones to authenticated;
revoke update on public.notificaciones from authenticated;
grant update (leida) on public.notificaciones to authenticated;

-- Reportes: todos leen; nadie inserta directo (solo la RPC).
-- Riesgo aceptado (decisión 55): usuario_id es un uuid sin nombre; el
-- repositorio lo oculta en los anónimos.
drop policy if exists "Ver reportes" on public.reportes;
create policy "Ver reportes" on public.reportes
  for select to anon, authenticated using (true);
grant select on public.reportes to anon, authenticated;

-- Tiempo real (5.5)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reportes'
  ) then
    alter publication supabase_realtime add table public.reportes;
  end if;
end $$;
