// Grid de 8 pt
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

// Área táctil mínima
export const minTouch = 44;

export const borderWidths = {
  hairline: 1,
  strong: 1.5,
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
  cardPadding: 14,
  badgeDot: 10,
  // Mapa provisional (F1_04)
  mapStop: 20,
  mapUser: 16,
  mapUserHalo: 36,
  mapRoad: 10,
} as const;

// Feedback al presionar y estado deshabilitado
export const opacity = {
  pressed: 0.7,
  disabled: 0.4,
} as const;
