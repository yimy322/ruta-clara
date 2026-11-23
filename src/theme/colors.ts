// RC-HF/Color/* (Figma, página de alta fidelidad 69:441)
export const colors = {
  ink: "#1C1C1C",
  inkMuted: "#6B6B6B",
  // Fondo del botón Primary presionado
  inkPressed: "#3A3A38",
  line: "#D9D9D4",
  surface: "#FFFFFF",
  canvas: "#F7F6F2",
  scrim: "rgba(0, 0, 0, 0.45)",
  // Pista del Toggle apagado (3,3:1 sobre tarjeta)
  controlOff: "#8E8D87",
  // Mapa provisional: fondo, manzanas, parques y avenidas
  map: "#ECEAE3",
  block: "#E3E0D6",
  park: "#DCE5D3",
  avenue: "#F7F1D6",
  yellow: "#FFE15C",
  yellowSoft: "#FFF6D1",
  // Punto «en vivo» y borde de la ruta recomendada
  yellowDeep: "#E8B400",
  red: "#C93B29",
  redSoft: "#FDECEA",
  // Texto e íconos rojos sobre redSoft (contraste AA)
  redStrong: "#B33424",
  // Relleno de ALERTA URGENTE mientras se mantiene presionado (F2_07) // supuesto
  redDeep: "#A62F20",
  blue: "#2B78D9",
  blueHalo: "rgba(43, 120, 217, 0.22)",
  amber: "#F2A93B",
} as const;

export type ColorToken = keyof typeof colors;
