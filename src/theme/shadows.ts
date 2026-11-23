import type { ViewStyle } from "react-native";

// RC-HF/Shadow/* y RC-HF/Focus/Ring (Figma). Se usa boxShadow (Nueva
// Arquitectura): funciona igual en iOS y Android y admite varias capas y spread.
// Formato: offsetX offsetY blur spread color. El blur de CSS equivale al radio de Figma.
const ink = (alpha: number) => `rgba(28, 28, 28, ${alpha})`;

export const shadows = {
  card: { boxShadow: `0 1px 2px 0 ${ink(0.06)}, 0 8px 24px 0 ${ink(0.08)}` },
  float: { boxShadow: `0 1px 2px 0 ${ink(0.06)}, 0 8px 24px 0 ${ink(0.12)}` },
  sheet: { boxShadow: `0 -8px 24px 0 ${ink(0.08)}` },
  pin: { boxShadow: `0 6px 16px 0 ${ink(0.18)}` },
  primary: { boxShadow: `0 8px 20px 0 ${ink(0.2)}` },
  danger: { boxShadow: "0 10px 24px 0 rgba(201, 59, 41, 0.35)" },
  // Anillo de foco: separación blanca de 2 + azul de 4
  focusRing: { boxShadow: "0 0 0 2px #FFFFFF, 0 0 0 4px #2B78D9" },
} satisfies Record<string, ViewStyle>;

export type ShadowToken = keyof typeof shadows;
