import { Pressable, StyleSheet, Text } from "react-native";

import { borderWidths, colors, opacity, radii, sizes, typography } from "@/theme";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
};

// Botón 52 pt. Primary = acción principal, Secondary = alternativa,
// Tertiary = enlace, Danger = seguridad/urgencia.
export function Button({
  label,
  onPress,
  variant = "primary",
  fullWidth = false,
  disabled = false,
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
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
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
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  fullWidth: {
    alignSelf: "stretch",
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
    borderWidth: borderWidths.strong,
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
