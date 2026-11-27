// Umbrales de antigüedad de los reportes. Son SUPUESTOS hasta tener datos
// reales de uso (Fase 5).

// Un reporte deja de contar como activo después de este tiempo. Una unidad
// cuyo último reporte de ubicación es más antiguo sale "sin datos" (estimada)
export const VIGENCIA_REPORTE_MIN = 30;

// Una unidad con reporte de ubicación más reciente que esto se muestra
// "en vivo"; si no, "reportado hace N min" (F3_02)
export const UMBRAL_EN_VIVO_MIN = 5;

// El chip de ocupación del paradero va en variante Live si el reporte es más
// reciente que esto (F3_02)
export const UMBRAL_OCUPACION_LIVE_MIN = 15;

// Ventana del estado y de la seguridad en el detalle de paradero ("Seguro 2 h", F3_02)
export const VENTANA_PARADERO_H = 2;

// Mapa de seguridad (F3_06): ventanas de tiempo que alterna el chip «2 h ▾»
export const VENTANAS_SEGURIDAD_H = [2, 6, 24] as const;

// Radio en metros de las zonas del mapa de seguridad (F3_06) sobre el mapa
// real. supuesto: Figma las dibuja en píxeles (144 y 92 px)
export const RADIO_ZONA_ALTA_M = 350;
export const RADIO_ZONA_MEDIA_M = 220;

// Reportes de seguridad en un paradero, dentro de la ventana, para que su
// zona sea alta; con menos (y al menos uno) es media
export const UMBRAL_ZONA_ALTA = 3;
