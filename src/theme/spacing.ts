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
  // Alta fidelidad: botones, tiles y tarjetas
  control: 16,
  // Alta fidelidad: insignias (List Item)
  badge: 12,
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
  iconButton: 44,
  iconGlyph: 20,
  toggleWidth: 44,
  toggleHeight: 26,
  toggleKnob: 20,
  toggleInset: 3,
  tileWidth: 104,
  tilePaddingY: 14,
  tileIcon: 36,
  // Ícono del Tile: círculo de 40 con glifo de 22
  tileIconCircle: 40,
  tileGlyph: 22,
  badge: 40,
  navHeight: 64,
  navIcon: 22,
  // Píldora amarilla de la pestaña activa
  navPill: 52,
  navPillHeight: 30,
  navPaddingBottom: 10,
  chipIcon: 16,
  chipPaddingX: 14,
  chipGap: 6,
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
  // Alta fidelidad: paradero «P», burbuja de unidad en vivo y avenida
  mapStopP: 28,
  mapBusCircle: 24,
  mapBusGlyph: 14,
  mapBusPadding: 5,
  mapAvenue: 18,
  mapUser: 16,
  mapUserHalo: 36,
  mapRoad: 10,
  // Detalle de ruta (F1_07)
  segmentedHeight: 40,
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
  // Reporte de seguridad (F2_07)
  optionHeightLarge: 56,
  radio: 24,
  radioDot: 10, // supuesto: Figma lo dibuja como imagen
  // Perfil (F2_09)
  // Indicador «a bordo» del header de F1_09
  indicadorViaje: 36,
  avatar: 64,
  // Alerta diaria (F3_03)
  dayCircle: 38,
  // Notificaciones (F3_04)
  notifIcon: 32,
  notifGlyph: 18,
  unreadDot: 8,
  // Ajustes y menú lateral (F3_05, F3_07)
  avatarSmall: 44,
  avatarMedium: 56,
  settingsIcon: 22,
  // Alto mínimo de una fila de Ajustes (área táctil 44 pt)
  minTouchRow: 44,
  chevron: 18,
  drawerWidth: 288,
  menuRowHeight: 65,
  // Estados vacíos y de error (E1–E10): círculo de la señal visual y su ícono
  estadoCirculo: 104,
  estadoCirculoGrande: 112,
  estadoCirculoCompacto: 96,
  estadoIcono: 44,
  estadoIconoGrande: 48,
  estadoIconoCompacto: 40,
  // Cuadro del ícono de la tarjeta de permiso de ubicación (E10)
  permisoIcono: 48,
  permisoGlyph: 24,
  // Píldora de nivel con ícono (señales sin depender del color, A2)
  leyendaIcono: 14,
  leyendaPaddingX: 10,
  leyendaPaddingY: 6,
  // Ícono del mensaje de validación junto al campo (E8)
  errorIcono: 18,
  // Esqueleto de carga de rutas (E2)
  esqueletoTexto: 14,
  esqueletoChip: 24,
  esqueletoLinea: 10,
  // Mapa de seguridad (F3_06): manchas de calor y leyenda
  zonaAlta: 144,
  zonaMedia: 92,
  legendDot: 8,
  legendPadding: 10,
  // Mi cuenta y eliminación (D1–D5): ícono del avatar y espacio sobre la señal de D5
  avatarIcono: 28,
  periodoGraciaTop: 64,
} as const;

// Feedback al presionar y estado deshabilitado
export const opacity = {
  pressed: 0.7,
  disabled: 0.4,
  // Centro de una mancha de calor del mapa de seguridad (F3_06) // supuesto
  zonaCentro: 0.55,
} as const;
