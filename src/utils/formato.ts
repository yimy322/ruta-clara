// Formato de textos de la interfaz.
import type { NivelTrafico, Ocupacion, Sentido, TipoUnidad, Velocidad } from "@/types";

// 2.5 → "S/ 2.50"
export const formatearPasaje = (monto: number) => `S/ ${monto.toFixed(2)}`;

// Fecha ISO → "ahora", "hace 4 min", "hace 2 h"
export const haceCuanto = (fechaISO: string) =>
  haceMinutos(Math.floor((Date.now() - new Date(fechaISO).getTime()) / 60_000));

// 4 → "hace 4 min"; 0 → "ahora"; 120 → "hace 2 h"
export function haceMinutos(minutos: number) {
  if (minutos < 1) {
    return "ahora";
  }
  if (minutos < 60) {
    return `hace ${minutos} min`;
  }
  return `hace ${Math.floor(minutos / 60)} h`;
}

// 40 → "hace 40 s"; 0 → "ahora"; 300 → "hace 5 min"
export function haceSegundos(segundos: number) {
  if (segundos < 1) {
    return "ahora";
  }
  if (segundos < 60) {
    return `hace ${segundos} s`;
  }
  return haceMinutos(Math.floor(segundos / 60));
}

// Fecha ISO → "7:52 AM"
export function formatearHora(fechaISO: string) {
  const fecha = new Date(fechaISO);
  const horas = fecha.getHours();
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  return `${horas % 12 || 12}:${minutos} ${horas < 12 ? "AM" : "PM"}`;
}

// 8 → "8 min"; si es estimado, 20 → "~20 min"
export const formatearEta = (minutos: number, estimado = false) => `${estimado ? "~" : ""}${minutos} min`;

// 183 → "180 m"; 4321 → "4,3 km" (coma decimal, como se escribe en Perú)
export function formatearDistancia(metros: number) {
  const redondeado = Math.round(metros / 10) * 10;
  if (redondeado < 1000) {
    return `${redondeado} m`;
  }
  return `${(metros / 1000).toFixed(1).replace(".", ",")} km`;
}

// ("Ate – Surco", "vuelta") → "Recorrido Surco → Ate"
export function textoRecorrido(tramo: string, sentido: Sentido) {
  const extremos = tramo.split(" – ");
  return `Recorrido ${(sentido === "ida" ? extremos : [...extremos].reverse()).join(" → ")}`;
}

const OCUPACION: Record<Ocupacion, string> = {
  sentados: "Sentados",
  lleno: "Lleno",
  sopa: "Sopa",
};

export const etiquetaOcupacion = (ocupacion: Ocupacion) => OCUPACION[ocupacion];

const VELOCIDAD: Record<Velocidad, string> = {
  normal: "Normal",
  lento: "Lento",
  chanteando: "Chanteando",
};

export const etiquetaVelocidad = (velocidad: Velocidad) => VELOCIDAD[velocidad];

const TRAFICO: Record<NivelTrafico, string> = {
  bajo: "Tráfico bajo",
  medio: "Tráfico medio",
  alto: "Tráfico alto",
};

export const etiquetaTrafico = (trafico: NivelTrafico) => TRAFICO[trafico];

const TIPO: Record<TipoUnidad, string> = {
  combi: "Combi",
  custer: "Custer",
  micro: "Micro",
};

export const etiquetaTipo = (tipo: TipoUnidad) => TIPO[tipo];

// "12 reportes activos · último hace 5 min"
export function textoReportes(reportesActivos: number, ultimoReporteMin: number | null) {
  const cantidad = `${reportesActivos} ${reportesActivos === 1 ? "reporte activo" : "reportes activos"}`;
  return ultimoReporteMin === null ? cantidad : `${cantidad} · último ${haceMinutos(ultimoReporteMin)}`;
}

// Minúsculas y sin tildes, igual que la búsqueda del repositorio
const normalizarLetra = (letra: string) =>
  letra
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// Divide `texto` alrededor de la primera coincidencia con `consulta`, sin
// importar tildes ni mayúsculas. ("Jockey Plaza", "pla") → ["Jockey ", "Pla", "za"]
export function partirCoincidencia(texto: string, consulta: string): [string, string, string] | null {
  const buscada = [...consulta.trim()].map(normalizarLetra).join("");
  if (buscada.length === 0) {
    return null;
  }
  // Cada letra normalizada recuerda su posición en el texto original
  let normalizado = "";
  const origen: number[] = [];
  [...texto].forEach((letra, i) => {
    const n = normalizarLetra(letra);
    normalizado += n;
    origen.push(...Array.from(n, () => i));
  });

  const pos = normalizado.indexOf(buscada);
  if (pos === -1) {
    return null;
  }
  const letras = [...texto];
  const inicio = origen[pos];
  const fin = origen[pos + buscada.length - 1] + 1;
  return [letras.slice(0, inicio).join(""), letras.slice(inicio, fin).join(""), letras.slice(fin).join("")];
}
