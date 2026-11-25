// Paletas del tema dinámico (4.6). Las pantallas no importan estas paletas:
// toman los colores del tema activo con useTema() (src/context/TemaContext).

// RC-HF/Color/* (Figma, página de alta fidelidad 69:441)
export const paletaClara = {
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
  // Texto e íconos sobre amarillo: siempre oscuro, en todos los temas
  onYellow: "#1C1C1C",
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

export type Paleta = { readonly [K in keyof typeof paletaClara]: string };
export type ColorToken = keyof Paleta;

// RC-HF-Dark/Color/* (Figma 93:1349: Inicio, Detalle de paradero, Alertas)
export const paletaOscura: Paleta = {
  ink: "#F2F1EC",
  inkMuted: "#A3A29C",
  inkPressed: "#D9D8D2", // supuesto: Figma no dibuja el primario presionado en oscuro
  line: "#3A3A37",
  surface: "#1F1F1D",
  canvas: "#141413",
  scrim: "rgba(0, 0, 0, 0.6)", // supuesto
  controlOff: "#7A7974", // supuesto: valor del contexto, no aparece en los frames
  map: "#22221F",
  block: "#2A2A27",
  park: "#1F2A1E",
  avenue: "#3A3524",
  yellow: "#FFE15C",
  yellowSoft: "#3A3212",
  yellowDeep: "#E8B400",
  onYellow: "#1C1C1C",
  red: "#FF6B57",
  redSoft: "#3D1E1A",
  redStrong: "#FF6B57", // supuesto: en oscuro el texto rojo sobre redSoft usa Red
  redDeep: "#E0533F", // supuesto
  blue: "#5B9BEB",
  blueHalo: "rgba(91, 155, 235, 0.22)",
  amber: "#F2A93B", // supuesto: igual que en claro
};

// RC-HF-HC/Color/* (Figma P1 108:1868). Solo existe sobre el tema claro
export const paletaAltoContraste: Paleta = {
  ...paletaClara,
  ink: "#000000",
  inkMuted: "#333333",
  inkPressed: "#333333", // supuesto
  line: "#000000",
  surface: "#FFFFFF",
  canvas: "#FFFFFF",
  controlOff: "#555555",
  map: "#EDEDED",
  block: "#C9C9C9",
  park: "#BFD9B0",
  avenue: "#E3D9A8",
  yellowDeep: "#7A5E00",
  onYellow: "#000000",
  red: "#A3271A",
  redSoft: "#FBE3DF",
  redStrong: "#8F1F14",
  blue: "#1453A8",
  blueHalo: "rgba(20, 83, 168, 0.22)",
};
