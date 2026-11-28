-- RutaClara · 008 · Demo siempre «en vivo» (Fase 8, decisión 79).
-- Cada 30 min vuelve a fechar los reportes de ejemplo con refrescar_demo()
-- (003), así la demo no depende del botón de /dev/datos (queda de respaldo).
-- Ejecutar después de 007. Se puede volver a correr.
create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'refrescar-demo') then
    perform cron.unschedule('refrescar-demo');
  end if;
end $$;

select cron.schedule('refrescar-demo', '*/30 * * * *', 'select public.refrescar_demo()');
