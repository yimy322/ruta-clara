// Parámetros de la simulación del viaje en vivo (F1_08–F1_09).
// Son SUPUESTOS hasta tener datos reales de las unidades (Fase 5 / Fase 6).

// Velocidad media de una unidad en tráfico de Lima, para estimar ETAs
export const VELOCIDAD_MEDIA_KMH = 12;

// Cada cuánto baja 1 min la ETA mientras se espera la unidad
export const INTERVALO_ETA_MS = 5000;

// Cada cuánto avanza un paradero el viaje a bordo
export const INTERVALO_PARADERO_MS = 4000;

// Calle donde está el usuario (F1_05, F2_01). Fase 6: dirección real a partir
// de la ubicación del celular.
export const CALLE_USUARIO = "Av. Javier Prado";

// Precisión del GPS al confirmar un reporte (F2_04). Fase 6: sale del celular.
export const PRECISION_GPS_M = 15; // supuesto
