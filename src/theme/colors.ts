// RC/Color/* (Figma)
export const colors = {
  ink: "#1C1C1C",
  inkMuted: "#6B6B6B",
  line: "#D9D9D4",
  surface: "#FFFFFF",
  canvas: "#F7F6F2",
  map: "#ECEAE3",
  scrim: "rgba(0, 0, 0, 0.45)",
  yellow: "#FFE15C",
  yellowSoft: "#FFF6D1",
  red: "#D9412E",
  redSoft: "#FDECEA",
  // Relleno de ALERTA URGENTE mientras se mantiene presionado (F2_07) // supuesto
  redDeep: "#A62F20",
  blue: "#2B78D9",
  blueHalo: "rgba(43, 120, 217, 0.22)",
  amber: "#F2A93B",
} as const;

export type ColorToken = keyof typeof colors;
