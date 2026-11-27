-- RutaClara · 005 · Orden en que se marcaron favoritos y se crearon alertas
-- (F3_01 los muestra en ese orden). clock_timestamp() avanza fila por fila,
-- así un insert de varias filas conserva su orden. Se puede volver a correr.

alter table public.lineas_favoritas
  add column if not exists creado_en timestamptz not null default clock_timestamp();

alter table public.paraderos_favoritos
  add column if not exists creado_en timestamptz not null default clock_timestamp();

alter table public.alertas
  add column if not exists creado_en timestamptz not null default clock_timestamp();
