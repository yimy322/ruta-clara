// Formato de textos de la interfaz.
import type {
  CausaTransito,
  Destino,
  Linea,
  Paradero,
  ProximaUnidad,
  LineaSugerida,
  NivelCongestion,
  NivelTrafico,
  Ocupacion,
  ReporteHistorial,
  Sentido,
  TiempoEspera,
  TipoReporte,
  TipoSeguridad,
  TipoUnidad,
  Velocidad,
  Via,
} from "@/types";

// 2.5 → "S/ 2.50"
export const formatearPasaje = (monto: number) => `S/ ${monto.toFixed(2)}`;

// Minutos enteros transcurridos desde la fecha ISO
export const minutosDesde = (fechaISO: string) => Math.floor((Date.now() - new Date(fechaISO).getTime()) / 60_000);

// Fecha ISO → "ahora", "hace 4 min", "hace 2 h"
export const haceCuanto = (fechaISO: string) => haceMinutos(minutosDesde(fechaISO));

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

// (7, 0) → "7:00 AM"; (18, 5) → "6:05 PM"
export function formatoHora(hora: number, minuto: number) {
  return `${hora % 12 || 12}:${String(minuto).padStart(2, "0")} ${hora < 12 ? "AM" : "PM"}`;
}

// Fecha ISO → "7:52 AM"
export function formatearHora(fechaISO: string) {
  const fecha = new Date(fechaISO);
  return formatoHora(fecha.getHours(), fecha.getMinutes());
}

// Días como en Date.getDay() (0 = domingo), en el orden de la semana: lunes primero
const SEMANA = [1, 2, 3, 4, 5, 6, 0];
const LABORABLES = [1, 2, 3, 4, 5];
const FIN_DE_SEMANA = [6, 0];
// "Mi" distingue el miércoles del martes
const INICIAL_DIA = ["D", "L", "M", "Mi", "J", "V", "S"];

// [1, 2, 3, 4, 5] → "L–V"; los 7 → "Todos los días"; [6, 0] → "Fin de semana";
// [5, 1, 3] → "L, Mi, V"
export function formatoDias(dias: number[]) {
  const elegidos = new Set(dias);
  const son = (grupo: number[]) => elegidos.size === grupo.length && grupo.every((dia) => elegidos.has(dia));
  if (son(SEMANA)) {
    return "Todos los días";
  }
  if (son(LABORABLES)) {
    return "L–V";
  }
  if (son(FIN_DE_SEMANA)) {
    return "Fin de semana";
  }
  return SEMANA.filter((dia) => elegidos.has(dia))
    .map((dia) => INICIAL_DIA[dia])
    .join(", ");
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];

// Fecha ISO → "Hoy 7:16 AM", "Ayer 6:40 PM", "12 oct 6:40 PM"
export function formatearDia(fechaISO: string) {
  const fecha = new Date(fechaISO);
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  let dia = `${fecha.getDate()} ${MESES[fecha.getMonth()]}`;
  if (fecha.toDateString() === new Date().toDateString()) {
    dia = "Hoy";
  } else if (fecha.toDateString() === ayer.toDateString()) {
    dia = "Ayer";
  }
  return `${dia} ${formatearHora(fechaISO)}`;
}

// 1240 → "1,240"
export const formatearPuntos = (puntos: number) => puntos.toLocaleString("es-PE");

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

const ESPERA: Record<TiempoEspera, string> = {
  "5_10": "Esperando 5–10 min",
  "15_20": "15–20 min",
  mas_30: "Más de 30 min",
};

export const etiquetaEspera = (espera: TiempoEspera) => ESPERA[espera];

// Desde el menor valor del rango reportado (F3_02)
const ESPERA_PARADERO: Record<TiempoEspera, string> = {
  "5_10": "Espera ~5 min",
  "15_20": "Espera ~15 min",
  mas_30: "Espera +30 min",
};

export const textoEsperaParadero = (espera: TiempoEspera) => ESPERA_PARADERO[espera];

// "Lleno · en vivo", "Sopa · reportado hace 9 min", "Sin datos recientes" (F3_02)
export function textoProximaUnidad({ fuente, ocupacion, reportadoEn }: ProximaUnidad) {
  if (fuente === "sin_datos" || !reportadoEn) {
    return "Sin datos recientes";
  }
  const detalle = fuente === "en_vivo" ? "en vivo" : `reportado ${haceCuanto(reportadoEn)}`;
  return ocupacion ? `${etiquetaOcupacion(ocupacion)} · ${detalle}` : detalle[0].toUpperCase() + detalle.slice(1);
}

const CONGESTION: Record<NivelCongestion, string> = {
  fluido: "Fluido",
  moderado: "Moderado",
  pesado: "Pesado",
  trancadera: "Trancadera",
};

export const etiquetaCongestion = (congestion: NivelCongestion) => CONGESTION[congestion];

const CAUSA: Record<CausaTransito, string> = {
  obras: "Obras en la pista",
  choque: "Choque",
  semaforo: "Semáforo malogrado",
  marcha: "Marcha / paro",
  fiscalizacion: "Fiscalización",
  inundacion: "Pista inundada",
};

export const etiquetaCausa = (causa: CausaTransito) => CAUSA[causa];

const SEGURIDAD: Record<TipoSeguridad, string> = {
  paradero_peligroso: "Paradero peligroso",
  robo: "Robo en unidad",
  acoso: "Acoso",
  conductor_imprudente: "Conductor imprudente",
};

export const etiquetaSeguridad = (seguridad: TipoSeguridad) => SEGURIDAD[seguridad];

const TIPO_REPORTE: Record<TipoReporte, string> = {
  ubicacion: "Ubicación",
  paradero: "Paradero",
  transito: "Tránsito",
  seguridad: "Seguridad",
  desvio: "Desvío",
  valoracion: "Valoración",
};

// "Ubicación · La 50", "Trancadera · Evitamiento", "Robo en unidad"
export function tituloHistorial({ reporte, linea }: ReporteHistorial) {
  let tipo = TIPO_REPORTE[reporte.tipo];
  if (reporte.congestion) {
    tipo = etiquetaCongestion(reporte.congestion);
  } else if (reporte.seguridad) {
    tipo = etiquetaSeguridad(reporte.seguridad);
  }
  const donde = linea?.nombre ?? reporte.via;
  return donde ? `${tipo} · ${donde}` : tipo;
}

// "Vía Evitamiento · altura Ate"
export const textoVia = (via: Via) => `${via.nombre} · ${via.referencia}`;

// "12 reportes activos · último hace 5 min"
export function textoReportes(reportesActivos: number, ultimoReporteMin: number | null) {
  const cantidad = `${reportesActivos} ${reportesActivos === 1 ? "reporte activo" : "reportes activos"}`;
  return ultimoReporteMin === null ? cantidad : `${cantidad} · último ${haceMinutos(ultimoReporteMin)}`;
}

// "Custer · Ate – Surco · 12 reportes hoy"; sin reportes, solo tipo y tramo
export function textoLineaSugerida({ linea, reportesHoy }: LineaSugerida) {
  const base = `${etiquetaTipo(linea.tipo)} · ${linea.tramo}`;
  if (reportesHoy === 0) {
    return base;
  }
  return `${base} · ${reportesHoy} ${reportesHoy === 1 ? "reporte" : "reportes"} hoy`;
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

// "Paradero Puente Nuevo" → "Puente Nuevo"
const sinPrefijoParadero = (nombre: string) => nombre.replace(/^Paradero\s+/i, "");

// "La 50 · Puente Nuevo → Jockey Plaza" (rutas guardadas, F3_01)
export const textoRutaAlerta = (linea: Linea, paradero: Paradero, destino: Destino) =>
  `${linea.nombre} · ${sinPrefijoParadero(paradero.nombre)} → ${destino.nombre}`;
