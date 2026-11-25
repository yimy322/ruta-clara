import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { borderWidths, opacity, radii, sizes, spacing, type Tema } from "@/theme";
import { withIconDefaults } from "@/utils/icons";

export type TileState = "default" | "selected" | "danger";

type TileProps = {
  label: string;
  // Ícono de lucide-react-native; va en un círculo de 40 pt
  icon?: ReactNode;
  state?: TileState;
  onPress: () => void;
  // Ocupa el ancho disponible en vez de 104 pt, para repartirse una fila (F1_10)
  fill?: boolean;
  // Gris pero presionable, p. ej. una insignia bloqueada (F2_09)
  atenuado?: boolean;
};

// Tile de selección con ícono (Figma 69:474), 104 pt de ancho. Tarjeta con
// sombra; Selected = amarillo con borde ink, Danger = seguridad (rojo suave).
export function Tile({ label, icon, state = "default", onPress, fill = false, atenuado = false }: TileProps) {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const containerStyles = useEstilos(crearContainerStyles);

  const color = state === "danger" ? colors.redStrong : state === "selected" ? colors.onYellow : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: state === "selected" }}
      style={({ pressed }) => [
        styles.base,
        fill && styles.fill,
        containerStyles[state],
        atenuado && styles.atenuado,
        pressed && styles.pressed,
      ]}
    >
      {icon != null && (
        <View style={[styles.icon, state !== "default" && styles.iconOnColor]}>
          {withIconDefaults(icon, { color, size: sizes.tileGlyph })}
        </View>
      )}
      <Text style={[typography.caption, styles.label, { color }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    base: {
      width: sizes.tileWidth,
      paddingHorizontal: spacing.sm,
      paddingVertical: sizes.tilePaddingY,
      gap: spacing.sm,
      borderRadius: radii.control,
      // Borde transparente en Default para que el tile no cambie de tamaño
      borderWidth: borderWidths.regular,
      alignItems: "center",
    },
    fill: {
      flex: 1,
      width: undefined,
      paddingHorizontal: spacing.xxs,
    },
    icon: {
      width: sizes.tileIconCircle,
      height: sizes.tileIconCircle,
      borderRadius: radii.pill,
      backgroundColor: colors.canvas,
      alignItems: "center",
      justifyContent: "center",
    },
    iconOnColor: {
      backgroundColor: colors.surface,
    },
    label: {
      textAlign: "center",
    },
    atenuado: {
      opacity: opacity.disabled,
    },
    pressed: {
      opacity: opacity.pressed,
    },
  });

const crearContainerStyles = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    default: {
      backgroundColor: colors.surface,
      borderColor: "transparent",
      ...shadows.card,
    },
    selected: {
      backgroundColor: colors.yellow,
      borderColor: colors.ink,
      ...shadows.card,
    },
    danger: {
      backgroundColor: colors.redSoft,
      borderColor: colors.red,
    },
  });
