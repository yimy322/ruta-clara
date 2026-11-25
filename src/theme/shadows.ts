import type { ViewStyle } from "react-native";

import type { Paleta } from "./colors";

// Modo visual del tema activo
export type ModoTema = "claro" | "oscuro" | "altoContraste";

// RC-HF/Shadow/*, RC-HF-Dark/Shadow/* y RC-HF/Focus/Ring. Se usa boxShadow
// (Nueva Arquitectura): funciona igual en iOS y Android y admite varias capas
// y spread. Formato: offsetX offsetY blur spread color.
// En alto contraste (Figma P1) se mantienen las sombras y además las tarjetas
// y los botones flotantes llevan un borde negro de 2: va dentro de la sombra,
// así lo recibe todo lo que ya usa la sombra.
export function crearSombras(paleta: Paleta, modo: ModoTema) {
  const sombra = modo === "oscuro" ? (a: number) => `rgba(0, 0, 0, ${a})` : (a: number) => `rgba(28, 28, 28, ${a})`;
  const borde: ViewStyle = modo === "altoContraste" ? { borderWidth: 2, borderColor: paleta.ink } : {};
  const oscuro = modo === "oscuro";

  return {
    card: {
      boxShadow: `0 1px 2px 0 ${sombra(oscuro ? 0.4 : 0.06)}, 0 8px 24px 0 ${sombra(oscuro ? 0.45 : 0.08)}`,
      ...borde,
    },
    float: {
      boxShadow: `0 1px 2px 0 ${sombra(oscuro ? 0.4 : 0.06)}, 0 8px 24px 0 ${sombra(oscuro ? 0.5 : 0.12)}`,
      ...borde,
    },
    sheet: { boxShadow: `0 -8px 24px 0 ${sombra(oscuro ? 0.45 : 0.08)}` },
    pin: { boxShadow: `0 6px 16px 0 ${sombra(oscuro ? 0.5 : 0.18)}` },
    primary: { boxShadow: `0 8px 20px 0 ${sombra(oscuro ? 0.5 : 0.2)}`, ...borde },
    danger: { boxShadow: "0 10px 24px 0 rgba(201, 59, 41, 0.35)", ...borde },
    // Anillo de foco: separación del color de fondo de 2 + azul de 4
    focusRing: { boxShadow: `0 0 0 2px ${paleta.surface}, 0 0 0 4px ${paleta.blue}` },
  } satisfies Record<string, ViewStyle>;
}

export type Sombras = ReturnType<typeof crearSombras>;
export type ShadowToken = keyof Sombras;
