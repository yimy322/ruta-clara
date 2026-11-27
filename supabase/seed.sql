-- RutaClara · Datos iniciales (los mocks de src/mocks, con los mismos ids).
-- Generado a partir de src/mocks; ejecutar después de 001–003. Se puede volver a correr.

insert into public.paraderos (id, nombre, direccion, distrito, lat, lng, orden)
values
  ('puente-nuevo', 'Paradero Puente Nuevo', 'Av. Nicolás Ayllón', 'El Agustino', -12.0436, -76.9988, 0),
  ('los-angeles', 'Paradero Los Ángeles', 'Av. Javier Prado Este', 'Ate', -12.0612, -76.9642, 1),
  ('av-la-molina', 'Av. La Molina', 'Av. Javier Prado Este con Av. La Molina', 'La Molina', -12.0768, -76.9573, 2),
  ('puente-primavera', 'Puente Primavera', 'Av. Primavera con Panamericana Sur', 'Santiago de Surco', -12.1093, -76.9907, 3),
  ('jockey-plaza', 'Jockey Plaza', 'Av. Javier Prado Este 4200', 'Santiago de Surco', -12.0853, -76.9768, 4),
  ('angamos', 'Paradero Angamos', 'Av. Angamos Este', 'Surquillo', -12.1112, -77.0115, 5),
  ('plaza-norte', 'Plaza Norte', 'Av. Tomás Valle con Panamericana Norte', 'Independencia', -12.0063, -77.059, 6),
  ('chosica', 'Chosica', 'Carretera Central km 34', 'Lurigancho-Chosica', -11.9369, -76.6962, 7),
  ('callao', 'Plaza Grau', 'Av. Sáenz Peña', 'Callao', -12.0589, -77.1458, 8),
  ('ancon', 'Ancón', 'Av. Andrés Avelino Cáceres', 'Ancón', -11.773, -77.176, 9),
  ('centro-lima', 'Plaza Dos de Mayo', 'Av. Nicolás de Piérola', 'Cercado de Lima', -12.0464, -77.0428, 10),
  ('proceres-sjl', 'Av. Próceres', 'Av. Próceres de la Independencia', 'San Juan de Lurigancho', -11.9942, -77.0003, 11),
  ('vitarte', 'Vitarte', 'Carretera Central km 7', 'Ate', -12.0283, -76.9302, 12),
  ('ovalo-miraflores', 'Óvalo de Miraflores', 'Av. Arequipa con Av. José Larco', 'Miraflores', -12.1211, -77.0301, 13)
on conflict (id) do update set nombre = excluded.nombre, direccion = excluded.direccion, distrito = excluded.distrito, lat = excluded.lat, lng = excluded.lng, orden = excluded.orden;

insert into public.lineas (id, codigo, nombre, tipo, empresa, tramo, pasaje, frecuencia_min, horario, recorrido_ida, recorrido_vuelta, afluencia, suspendida, orden)
values
  ('la-50', '50', 'La 50', 'custer', 'Empresa de Transportes 50 S.A.', 'Ate – Surco', 2.5, 6, '5am–11pm', array['puente-nuevo', 'los-angeles', 'av-la-molina', 'puente-primavera', 'jockey-plaza', 'angamos'], array['angamos', 'jockey-plaza', 'puente-primavera', 'av-la-molina', 'los-angeles', 'puente-nuevo'], array[25, 90, 100, 60, 40, 45, 90, 100, 35], false, 0),
  ('el-chosicano', 'CH', 'El Chosicano', 'micro', 'Transportes El Chosicano S.A.', 'Chosica – Callao', 3, 8, '4:30am–11pm', array['chosica', 'vitarte', 'puente-nuevo', 'jockey-plaza', 'centro-lima', 'callao'], array['callao', 'centro-lima', 'jockey-plaza', 'puente-nuevo', 'vitarte', 'chosica'], array[40, 95, 85, 50, 45, 50, 85, 90, 30], false, 1),
  ('anconero', 'AN', 'Anconero', 'combi', 'Empresa de Transportes Anconero S.A.', 'Ancón – Centro de Lima', 2, 15, '5am–10pm', array['ancon', 'plaza-norte', 'centro-lima', 'puente-nuevo', 'jockey-plaza'], array['jockey-plaza', 'puente-nuevo', 'centro-lima', 'plaza-norte', 'ancon'], array[50, 100, 70, 40, 35, 40, 75, 80, 20], false, 2),
  ('la-73', '73', 'La 73', 'combi', 'Empresa de Transportes 73 S.A.', 'SJL – Surquillo', 2.5, 5, '5am–11pm', array['proceres-sjl', 'puente-nuevo', 'centro-lima', 'angamos'], array['angamos', 'centro-lima', 'puente-nuevo', 'proceres-sjl'], array[35, 100, 90, 55, 45, 50, 95, 85, 30], true, 3),
  ('santa-cruz', 'SC', 'Santa Cruz', 'micro', 'Empresa de Transportes Santa Cruz S.A.', 'Vitarte – Miraflores', 2.5, 10, '5am–11pm', array['vitarte', 'los-angeles', 'av-la-molina', 'angamos', 'ovalo-miraflores'], array['ovalo-miraflores', 'angamos', 'av-la-molina', 'los-angeles', 'vitarte'], array[30, 85, 95, 60, 50, 55, 90, 95, 40], false, 4)
on conflict (id) do update set codigo = excluded.codigo, nombre = excluded.nombre, tipo = excluded.tipo, empresa = excluded.empresa, tramo = excluded.tramo, pasaje = excluded.pasaje, frecuencia_min = excluded.frecuencia_min, horario = excluded.horario, recorrido_ida = excluded.recorrido_ida, recorrido_vuelta = excluded.recorrido_vuelta, afluencia = excluded.afluencia, suspendida = excluded.suspendida, orden = excluded.orden;

insert into public.destinos (id, nombre, distrito, lat, lng, orden)
values
  ('jockey-plaza', 'Jockey Plaza', 'Santiago de Surco', -12.0853, -76.9768, 0),
  ('gamarra', 'Gamarra', 'La Victoria', -12.065, -77.013, 1),
  ('plaza-norte', 'Plaza Norte', 'Independencia', -12.0063, -77.059, 2),
  ('centro-lima', 'Centro de Lima', 'Cercado de Lima', -12.0464, -77.0306, 3),
  ('chosica', 'Chosica', 'Lurigancho-Chosica', -11.9369, -76.6962, 4),
  ('ancon', 'Ancón', 'Ancón', -11.773, -77.176, 5)
on conflict (id) do update set nombre = excluded.nombre, distrito = excluded.distrito, lat = excluded.lat, lng = excluded.lng, orden = excluded.orden;

insert into public.vias (id, nombre, referencia, lat, lng, orden)
values
  ('evitamiento-ate', 'Vía Evitamiento', 'altura Ate', -12.0448, -76.9975, 0),
  ('javier-prado-la-molina', 'Av. Javier Prado Este', 'altura La Molina', -12.0768, -76.9535, 1),
  ('panamericana-sur-primavera', 'Panamericana Sur', 'altura Primavera', -12.1093, -76.9832, 2),
  ('carretera-central-vitarte', 'Carretera Central', 'altura Vitarte', -12.0283, -76.9312, 3)
on conflict (id) do update set nombre = excluded.nombre, referencia = excluded.referencia, lat = excluded.lat, lng = excluded.lng, orden = excluded.orden;

insert into public.busquedas (destino_id, tipo, orden)
values
  ('gamarra', 'reciente', 0),
  ('plaza-norte', 'reciente', 1),
  ('centro-lima', 'comun', 0),
  ('chosica', 'comun', 1),
  ('ancon', 'comun', 2)
on conflict (destino_id, tipo) do update set orden = excluded.orden;

insert into public.rutas_destino (destino_id, linea_id, eta_min, trafico, reportes_activos, ocupacion, orden)
values
  ('jockey-plaza', 'anconero', 20, 'bajo', 0, null, 0),
  ('jockey-plaza', 'la-50', 8, 'medio', 12, 'sentados', 1),
  ('jockey-plaza', 'el-chosicano', 14, 'alto', 7, 'lleno', 2),
  ('gamarra', 'la-73', 11, 'alto', 4, 'sopa', 0),
  ('gamarra', 'santa-cruz', 16, 'medio', 2, 'lleno', 1),
  ('plaza-norte', 'anconero', 25, 'medio', 0, null, 0),
  ('centro-lima', 'la-73', 9, 'alto', 4, 'sopa', 0),
  ('centro-lima', 'el-chosicano', 14, 'alto', 7, 'sentados', 1),
  ('centro-lima', 'anconero', 22, 'medio', 0, null, 2),
  ('chosica', 'el-chosicano', 18, 'bajo', 7, 'sentados', 0),
  ('ancon', 'anconero', 30, 'bajo', 0, null, 0)
on conflict (destino_id, linea_id) do update set eta_min = excluded.eta_min, trafico = excluded.trafico, reportes_activos = excluded.reportes_activos, ocupacion = excluded.ocupacion, orden = excluded.orden;

-- Reportes de ejemplo (sin usuario). refrescar_demo() les pone la fecha.
insert into public.reportes (id, tipo, linea_id, paradero_id, lat, lng, ocupacion, velocidad, nota, espera, congestion, via, seguridad, anonimo, confirmaciones, demo_hace, demo_ayer)
values
  ('r1', 'paradero', null, 'puente-nuevo', -12.0436, -76.9988, 'lleno', null, 'Mucha gente esperando', '15_20', null, null, null, false, 3, interval '4 minutes', null),
  ('r2', 'ubicacion', 'la-50', null, -12.036, -77.0066, 'lleno', 'lento', null, null, null, null, null, false, 3, interval '3 minutes', null),
  ('r3', 'transito', null, null, -12.0512, -76.9895, null, 'lento', 'Trancadera en Evitamiento', null, null, null, null, false, 5, interval '6 minutes', null),
  ('r4', 'ubicacion', 'el-chosicano', null, -12.0401, -76.9852, 'sentados', 'chanteando', null, null, null, null, null, false, 2, interval '9 minutes', null),
  ('r5', 'desvio', 'la-50', null, -12.0445, -76.9975, null, null, 'Desviada por Av. Brasil', null, null, null, null, false, 9, interval '15 minutes', null),
  ('r6', 'seguridad', null, 'angamos', -12.1112, -77.0115, null, null, 'Robo reportado', null, null, null, 'robo', true, 4, interval '25 minutes', null),
  ('r7', 'ubicacion', 'la-50', null, -12.0448, -76.9985, 'lleno', null, null, null, null, null, null, false, 6, interval '4 minutes', null),
  ('r8', 'transito', null, null, -12.0512, -76.9895, null, null, null, null, 'trancadera', 'Evitamiento', null, false, 1, null, time '18:40'),
  ('rs1', 'seguridad', null, 'plaza-norte', -12.0063, -77.059, null, null, null, null, null, null, 'robo', true, 2, interval '40 minutes', null),
  ('rs2', 'seguridad', null, 'plaza-norte', -12.0063, -77.059, null, null, null, null, null, null, 'robo', true, 2, interval '55 minutes', null),
  ('rs3', 'seguridad', null, 'plaza-norte', -12.0063, -77.059, null, null, null, null, null, null, 'robo', true, 2, interval '70 minutes', null),
  ('rs4', 'seguridad', null, 'plaza-norte', -12.0063, -77.059, null, null, null, null, null, null, 'robo', true, 2, interval '85 minutes', null),
  ('rs5', 'seguridad', null, 'plaza-norte', -12.0063, -77.059, null, null, null, null, null, null, 'robo', true, 2, interval '100 minutes', null),
  ('rs6', 'seguridad', null, 'los-angeles', -12.0612, -76.9642, null, null, null, null, null, null, 'acoso', true, 1, interval '35 minutes', null),
  ('rs7', 'seguridad', null, 'los-angeles', -12.0612, -76.9642, null, null, null, null, null, null, 'paradero_peligroso', true, 1, interval '80 minutes', null)
on conflict (id) do update set tipo = excluded.tipo, linea_id = excluded.linea_id, paradero_id = excluded.paradero_id, lat = excluded.lat, lng = excluded.lng, ocupacion = excluded.ocupacion, velocidad = excluded.velocidad, nota = excluded.nota, espera = excluded.espera, congestion = excluded.congestion, via = excluded.via, seguridad = excluded.seguridad, anonimo = excluded.anonimo, confirmaciones = excluded.confirmaciones, demo_hace = excluded.demo_hace, demo_ayer = excluded.demo_ayer;

select public.refrescar_demo();

