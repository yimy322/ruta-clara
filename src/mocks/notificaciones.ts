import type { Notificacion } from "@/types";

// Fecha ISO de hace n minutos, sin pasar de las 00:00 de hoy: así siempre cae en "Hoy"
function hoyHaceMin(n: number) {
  const inicioDelDia = new Date();
  inicioDelDia.setHours(0, 0, 0, 0);
  return new Date(Math.max(Date.now() - n * 60_000, inicioDelDia.getTime())).toISOString();
}

// Fecha ISO de ayer a la hora indicada
function ayerALas(horas: number, minutos: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - 1);
  fecha.setHours(horas, minutos, 0, 0);
  return fecha.toISOString();
}

// Avisos de ejemplo del centro de notificaciones (F3_04). No hay avisos de
// llegada: se crean con "Simular aviso de alerta" (Perfil, solo desarrollo).
export const notificaciones: Notificacion[] = [
  {
    id: "n1",
    tipo: "desvio",
    titulo: "La ruta 50 está desviada por Av. Brasil",
    detalle: "Reportado por 9 pasajeros",
    fecha: hoyHaceMin(14),
    leida: false,
    lineaId: "la-50",
  },
  {
    id: "n2",
    tipo: "transito",
    titulo: "Tráfico intenso en Puente Nuevo",
    detalle: "Sal 10 min antes",
    fecha: hoyHaceMin(32),
    leida: true,
    paraderoId: "puente-nuevo",
  },
  {
    id: "n3",
    tipo: "seguridad",
    titulo: "Alerta de seguridad en Paradero Angamos",
    detalle: "Robo reportado",
    fecha: ayerALas(19, 12),
    leida: true, // supuesto: Figma no la muestra sin leer
    paraderoId: "angamos",
  },
  {
    id: "n4",
    tipo: "logro",
    titulo: "Subiste a Cazador de Combis",
    detalle: "+100 pts de bonificación",
    fecha: ayerALas(18, 20),
    leida: true,
  },
];
