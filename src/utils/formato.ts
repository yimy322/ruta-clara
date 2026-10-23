// Formato de textos de la interfaz.
import type { Ocupacion } from "@/types";

// 2.5 → "S/ 2.50"
export const formatearPasaje = (monto: number) => `S/ ${monto.toFixed(2)}`;

// Fecha ISO → "ahora", "hace 4 min", "hace 2 h"
export function haceCuanto(fechaISO: string) {
  const minutos = Math.floor((Date.now() - new Date(fechaISO).getTime()) / 60_000);
  if (minutos < 1) {
    return "ahora";
  }
  if (minutos < 60) {
    return `hace ${minutos} min`;
  }
  return `hace ${Math.floor(minutos / 60)} h`;
}

// 8 → "8 min"; si es estimado, 20 → "~20 min"
export const formatearEta = (minutos: number, estimado = false) => `${estimado ? "~" : ""}${minutos} min`;

// 183 → "180 m"; 1400 → "1.4 km"
export function formatearDistancia(metros: number) {
  if (metros < 1000) {
    return `${Math.round(metros / 10) * 10} m`;
  }
  return `${(metros / 1000).toFixed(1)} km`;
}

const OCUPACION: Record<Ocupacion, string> = {
  sentados: "Sentados",
  lleno: "Lleno",
  sopa: "Sopa",
};

export const etiquetaOcupacion = (ocupacion: Ocupacion) => OCUPACION[ocupacion];
