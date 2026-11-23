import { colors } from "./colors";
import { fonts, typography } from "./typography";
import { shadows } from "./shadows";
import { borderWidths, minTouch, opacity, radii, sizes, spacing } from "./spacing";

export * from "./colors";
export * from "./typography";
export * from "./spacing";
export * from "./shadows";

export const theme = {
  colors,
  typography,
  fonts,
  spacing,
  radii,
  borderWidths,
  sizes,
  opacity,
  minTouch,
  shadows,
} as const;
