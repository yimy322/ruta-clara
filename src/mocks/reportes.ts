import type { Reporte } from "@/types";

// Fecha ISO de hace n minutos, relativa a cuando se carga el módulo.
const haceMin = (n: number) => new Date(Date.now() - n * 60_000).toISOString();

// Reportes de ejemplo (F1_04, F1_06, F1_08, F3_04). Anconero no tiene
// reportes a propósito: sale como "estimado" en la búsqueda.
export const reportes: Reporte[] = [
  {
    id: "r1",
    tipo: "paradero",
    paraderoId: "puente-nuevo",
    lat: -12.0436,
    lng: -76.9988,
    ocupacion: "lleno", // supuesto: F1_04 muestra "Lleno" en la card
    nota: "Mucha gente esperando",
    creadoEn: haceMin(4),
    confirmaciones: 3,
  },
  {
    id: "r2",
    tipo: "ubicacion",
    lineaId: "la-50",
    // ~1,2 km al noroeste del Paradero Puente Nuevo, como el chip de F1_08
    lat: -12.036,
    lng: -77.0066,
    ocupacion: "lleno",
    velocidad: "lento",
    creadoEn: haceMin(5),
    confirmaciones: 3,
  },
  {
    id: "r3",
    tipo: "transito",
    lat: -12.0512,
    lng: -76.9895,
    velocidad: "lento",
    nota: "Trancadera en Evitamiento",
    creadoEn: haceMin(6),
    confirmaciones: 5,
  },
  {
    id: "r4",
    tipo: "ubicacion",
    lineaId: "el-chosicano",
    lat: -12.0401,
    lng: -76.9852,
    ocupacion: "sentados",
    velocidad: "chanteando",
    creadoEn: haceMin(9),
    confirmaciones: 2,
  },
  {
    id: "r5",
    tipo: "desvio",
    lineaId: "la-50",
    lat: -12.0445,
    lng: -76.9975,
    nota: "Desviada por Av. Brasil",
    creadoEn: haceMin(15),
    confirmaciones: 9,
  },
  {
    id: "r6",
    tipo: "seguridad",
    paraderoId: "angamos",
    lat: -12.1112,
    lng: -77.0115,
    nota: "Robo reportado",
    creadoEn: haceMin(25),
    confirmaciones: 4,
  },
];
