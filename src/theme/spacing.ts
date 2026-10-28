// Grid de 8 pt
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 24,
  // Ilustraciones del onboarding (F1_02–F1_03)
  art: 16,
  pill: 999,
} as const;

// Área táctil mínima
export const minTouch = 44;

// Grosores de borde (Figma): thin = chips y divisores, regular = controles y
// cards, thick = card recomendada
export const borderWidths = {
  thin: 1,
  regular: 1.5,
  thick: 2.5,
  // Nivel de congestión elegido (F2_06)
  medium: 2,
} as const;

// Medidas de los componentes base (Figma)
export const sizes = {
  buttonHeight: 52,
  buttonPaddingX: 20,
  chipHeight: 32,
  iconButton: 36,
  iconGlyph: 18,
  toggleWidth: 44,
  toggleHeight: 26,
  toggleKnob: 20,
  toggleInset: 3,
  tileWidth: 104,
  tilePaddingY: 14,
  tileIcon: 36,
  badge: 36,
  navHeight: 64,
  navIcon: 22,
  chipIcon: 14,
  searchHeight: 44,
  // Campos origen/destino (F1_05)
  fieldHeight: 40,
  fieldDot: 8,
  // Mini-mapa de resultados (F1_06)
  miniMap: 120,
  cardPadding: 14,
  badgeDot: 10,
  // Mapa provisional (F1_04)
  mapStop: 20,
  mapUser: 16,
  mapUserHalo: 36,
  mapRoad: 10,
  // Detalle de ruta (F1_07)
  segmentedHeight: 40,
  segmentedRadius: 12,
  routeMap: 140,
  mapRoute: 3,
  mapLabelPaddingX: 6,
  mapLabelPaddingY: 3,
  statPadding: 10,
  chartHeight: 44,
  chartBarMax: 40,
  // Viaje en vivo (F1_08–F1_10)
  buttonHeightLarge: 56,
  grabberWidth: 40,
  grabberHeight: 4,
  mapDash: 6,
  progressHeight: 6,
  timelineDot: 18,
  timelineRowPaddingY: 10,
  successIcon: 80,
  successGlyph: 32,
  // Splash / Carga (F1_01)
  isotipo: 96,
  progressTrack: 220,
  progressFill: 120,
  // Onboarding (F1_02–F1_03)
  onboardingArt: 260,
  onboardingArtCompact: 240,
  dot: 6,
  dotActive: 24,
  dotGap: 6,
  prePermisoIcon: 32,
  // Reporte de ubicación (F2_04, F2_08)
  stepPillPaddingY: 6,
  stepPillRadius: 12,
  pinHalo: 96,
  pinStem: 22,
  pinStemWidth: 2,
  successHalo: 128,
  successIconLarge: 100,
  successGlyphLarge: 40,
  // Reportes de paradero y tránsito (F2_05–F2_06)
  optionHeight: 48,
  optionRadius: 12,
  paraderoMap: 84,
  noteHeight: 96,
  congestionBar: 6,
  congestionGap: 6,
  congestionPaddingX: 6,
  congestionPaddingY: 10,
  photoThumb: 72, // supuesto: Figma no muestra la miniatura
} as const;

// Feedback al presionar y estado deshabilitado
export const opacity = {
  pressed: 0.7,
  disabled: 0.4,
} as const;
