import type { TextStyle } from "react-native";

// Familias cargadas desde @expo-google-fonts/inter. El peso lo define la
// familia; no se usa fontWeight (en Android rompe las fuentes personalizadas).
export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

// lineHeight 130 % en todos los RC/Type
const lh = (size: number) => Math.round(size * 1.3);

const style = (fontFamily: string, fontSize: number): TextStyle => ({
  fontFamily,
  fontSize,
  lineHeight: lh(fontSize),
});

// RC/Type/* (Figma)
export const typography = {
  display: style(fonts.bold, 40),
  h1: style(fonts.bold, 22),
  h2: style(fonts.bold, 18),
  title: style(fonts.semiBold, 15),
  body: style(fonts.regular, 14),
  bodyStrong: style(fonts.semiBold, 14),
  caption: style(fonts.regular, 12),
  captionStrong: style(fonts.semiBold, 12),
  overline: {
    ...style(fonts.semiBold, 11),
    textTransform: "uppercase",
    letterSpacing: 0.66, // 6 % de 11
  },
  button: style(fonts.semiBold, 15),
  tab: style(fonts.medium, 11),
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
