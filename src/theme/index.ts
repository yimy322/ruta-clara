import { colors } from "./colors";
import { fonts, typography } from "./typography";
import { borderWidths, minTouch, opacity, radii, sizes, spacing } from "./spacing";

export * from "./colors";
export * from "./typography";
export * from "./spacing";

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
} as const;
