// Puntos y rangos de los reportes (F2_08–F2_09).
import type { Rango, TipoReporte } from "@/types";

export const PUNTOS_POR_TIPO: Record<TipoReporte, number> = {
  ubicacion: 15,
  paradero: 10,
  transito: 15,
  seguridad: 10,
  valoracion: 5,
  desvio: 15, // supuesto: mismo flujo que ubicación
};

// De menor a mayor
export const RANGOS: Rango[] = [
  { nombre: "Pasajero Junior", nombreCorto: "Pasajero Junior", puntosMinimos: 0 },
  { nombre: "Cazador de Combis", nombreCorto: "Cazador", puntosMinimos: 1000 },
  { nombre: "Rey del Paradero", nombreCorto: "Rey del Paradero", puntosMinimos: 1500 },
];
