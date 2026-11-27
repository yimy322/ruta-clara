-- RutaClara · 001 · Catálogo (lectura pública, sin escritura desde la app)
-- Ejecutar en el SQL Editor de Supabase. Se puede volver a correr.

create table if not exists public.paraderos (
  id text primary key,
  nombre text not null,
  direccion text not null,
  distrito text not null,
  lat double precision not null,
  lng double precision not null,
  -- Orden de los mocks (listas sin otro criterio)
  orden int not null default 0
);

create table if not exists public.lineas (
  id text primary key,
  codigo text not null,
  nombre text not null,
  tipo text not null check (tipo in ('combi', 'custer', 'micro')),
  empresa text not null,
  tramo text not null,
  pasaje numeric(5, 2) not null,
  frecuencia_min int not null,
  horario text not null,
  -- Ids de paraderos en orden de recorrido
  recorrido_ida text[] not null default '{}',
  recorrido_vuelta text[] not null default '{}',
  -- 9 valores (0–100) de 6am a 10pm, cada 2 h
  afluencia int[] not null default '{}',
  suspendida boolean not null default false,
  orden int not null default 0
);

create table if not exists public.destinos (
  id text primary key,
  nombre text not null,
  distrito text not null,
  lat double precision not null,
  lng double precision not null,
  -- Orden de los mocks (listas sin otro criterio)
  orden int not null default 0
);

create table if not exists public.vias (
  id text primary key,
  nombre text not null,
  referencia text not null,
  lat double precision not null,
  lng double precision not null,
  -- Orden de los mocks (listas sin otro criterio)
  orden int not null default 0
);

-- Destinos de la búsqueda sin texto (F1_05)
create table if not exists public.busquedas (
  destino_id text not null references public.destinos (id) on delete cascade,
  tipo text not null check (tipo in ('reciente', 'comun')),
  orden int not null,
  primary key (destino_id, tipo)
);

-- Líneas que sirven cada destino (F1_06). Más adelante, una vista agregada
create table if not exists public.rutas_destino (
  destino_id text not null references public.destinos (id) on delete cascade,
  linea_id text not null references public.lineas (id) on delete cascade,
  eta_min int not null,
  trafico text not null check (trafico in ('bajo', 'medio', 'alto')),
  reportes_activos int not null default 0,
  ocupacion text check (ocupacion in ('sentados', 'lleno', 'sopa')),
  orden int not null default 0,
  primary key (destino_id, linea_id)
);

-- RLS: todos leen, nadie escribe desde la app (el seed corre como admin)
do $$
declare
  tabla text;
begin
  foreach tabla in array array['paraderos', 'lineas', 'destinos', 'vias', 'busquedas', 'rutas_destino'] loop
    execute format('alter table public.%I enable row level security', tabla);
    execute format('drop policy if exists "Lectura pública" on public.%I', tabla);
    execute format('create policy "Lectura pública" on public.%I for select to anon, authenticated using (true)', tabla);
    execute format('grant select on public.%I to anon, authenticated', tabla);
  end loop;
end $$;
