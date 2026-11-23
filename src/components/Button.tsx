import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { borderWidths, colors, radii, shadows, sizes, spacing, typography } from "@/theme";
import { withIconDefaults } from "@/utils/icons";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  // Bordes de píldora, para botones flotantes (FAB)
  pill?: boolean;
  // 56 pt: acción urgente que debe encontrarse rápido (F1_09)
  large?: boolean;
};

// Botón 52 pt (Figma 69:450). Primary = acción principal, Secondary =
// alternativa, Tertiary = enlace, Danger = seguridad/urgencia.
// Estados: pressed, disabled y focus (anillo azul con teclado o lector).
export function Button({
  label,
  onPress,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  icon,
  pill = false,
  large = false,
}: ButtonProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        containerStyles[variant],
        !disabled && shadowStyles[variant],
        fullWidth && styles.fullWidth,
        pill && styles.pill,
        large && styles.large,
        pressed && !disabled && pressedStyles[variant],
        disabled && disabledStyles[variant],
        focused && !disabled && shadows.focusRing,
      ]}
    >
      {({ pressed }) => {
        const color = disabled ? colors.inkMuted : labelStyles[variant].color;
        return (
          <>
            {icon != null && withIconDefaults(icon, { color, size: sizes.iconGlyph })}
            <Text
              style={[typography.button, { color }, pressed && variant === "tertiary" && styles.tertiaryPressed]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.buttonHeight,
    paddingHorizontal: sizes.buttonPaddingX,
    borderRadius: radii.control,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  pill: {
    borderRadius: radii.pill,
  },
  large: {
    height: sizes.buttonHeightLarge,
  },
  // Figma no dibuja Tertiary presionado // supuesto: texto atenuado
  tertiaryPressed: {
    color: colors.inkMuted,
  },
});

const containerStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.ink,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
  },
  tertiary: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: colors.red,
  },
});

// Sombra de color solo en Primary y Danger habilitados
const shadowStyles = {
  primary: shadows.primary,
  secondary: undefined,
  tertiary: undefined,
  danger: shadows.danger,
} as const;

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: colors.inkPressed },
  secondary: { backgroundColor: colors.canvas },
  tertiary: {},
  // Figma deja Danger igual al presionar // supuesto: rojo intenso como respuesta
  danger: { backgroundColor: colors.redStrong },
});

// Deshabilitado: fondo line y texto inkMuted (no opacidad), como en Figma
const disabledStyles = StyleSheet.create({
  primary: { backgroundColor: colors.line },
  secondary: { borderColor: colors.line },
  tertiary: {},
  danger: { backgroundColor: colors.line },
});

const labelStyles = StyleSheet.create({
  primary: { color: colors.surface },
  secondary: { color: colors.ink },
  tertiary: { color: colors.ink },
  danger: { color: colors.surface },
});
