import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { borderWidths, colors, opacity, radii, sizes, spacing, typography } from "@/theme";
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

// Botón 52 pt. Primary = acción principal, Secondary = alternativa,
// Tertiary = enlace, Danger = seguridad/urgencia.
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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        containerStyles[variant],
        fullWidth && styles.fullWidth,
        pill && styles.pill,
        large && styles.large,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon != null &&
        withIconDefaults(icon, { color: labelStyles[variant].color, size: sizes.iconGlyph })}
      <Text style={[typography.button, labelStyles[variant]]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.buttonHeight,
    paddingHorizontal: sizes.buttonPaddingX,
    borderRadius: radii.lg,
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
  pressed: {
    opacity: opacity.pressed,
  },
  disabled: {
    opacity: opacity.disabled,
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

const labelStyles = StyleSheet.create({
  primary: { color: colors.surface },
  secondary: { color: colors.ink },
  tertiary: { color: colors.ink },
  danger: { color: colors.surface },
});
