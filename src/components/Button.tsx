import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { borderWidths, radii, sizes, spacing, type Tema } from "@/theme";
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
  const { colors, shadows, typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const containerStyles = useEstilos(crearContainerStyles);
  const pressedStyles = useEstilos(crearPressedStyles);
  const disabledStyles = useEstilos(crearDisabledStyles);
  const labelStyles = useEstilos(crearLabelStyles);
  // Sombra de color solo en Primary y Danger habilitados
  const shadowStyles = { primary: shadows.primary, secondary: undefined, tertiary: undefined, danger: shadows.danger };

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
              style={[typography.button, styles.label, { color }, pressed && variant === "tertiary" && styles.tertiaryPressed]}
              numberOfLines={2}
            >
              {label}
            </Text>
          </>
        );
      }}
    </Pressable>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    base: {
      // Altura mínima: con texto grande (hasta 200 %) el control crece en vez de cortar el texto
      minHeight: sizes.buttonHeight,
      paddingHorizontal: sizes.buttonPaddingX,
      paddingVertical: spacing.sm,
      borderRadius: radii.control,
      flexDirection: "row",
      gap: spacing.sm,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "flex-start",
    },
    // Con texto grande la etiqueta puede ir en 2 líneas, centrada
    label: {
      flexShrink: 1,
      textAlign: "center",
    },
    fullWidth: {
      alignSelf: "stretch",
    },
    pill: {
      borderRadius: radii.pill,
    },
    large: {
      // Altura mínima: con texto grande (hasta 200 %) el control crece en vez de cortar el texto
      minHeight: sizes.buttonHeightLarge,
    },
    // Figma no dibuja Tertiary presionado // supuesto: texto atenuado
    tertiaryPressed: {
      color: colors.inkMuted,
    },
  });

const crearContainerStyles = ({ colors }: Tema) =>
  StyleSheet.create({
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

const crearPressedStyles = ({ colors }: Tema) =>
  StyleSheet.create({
    primary: { backgroundColor: colors.inkPressed },
    secondary: { backgroundColor: colors.canvas },
    tertiary: {},
    // Figma deja Danger igual al presionar // supuesto: rojo intenso como respuesta
    danger: { backgroundColor: colors.redStrong },
  });

// Deshabilitado: fondo line y texto inkMuted (no opacidad), como en Figma
const crearDisabledStyles = ({ colors }: Tema) =>
  StyleSheet.create({
    primary: { backgroundColor: colors.line },
    secondary: { borderColor: colors.line },
    tertiary: {},
    danger: { backgroundColor: colors.line },
  });

const crearLabelStyles = ({ colors }: Tema) =>
  StyleSheet.create({
    primary: { color: colors.surface },
    secondary: { color: colors.ink },
    tertiary: { color: colors.ink },
    danger: { color: colors.surface },
  });
