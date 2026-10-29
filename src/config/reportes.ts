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
