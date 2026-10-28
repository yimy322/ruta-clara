import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { borderWidths, colors, opacity, radii, sizes, spacing, typography } from "@/theme";
import { withIconDefaults } from "@/utils/icons";

export type TileState = "default" | "selected" | "danger";

type TileProps = {
  label: string;
  icon?: ReactNode;
  state?: TileState;
  onPress: () => void;
  // Ocupa el ancho disponible en vez de 104 pt, para repartirse una fila (F1_10)
  fill?: boolean;
  // Gris pero presionable, p. ej. una insignia bloqueada (F2_09)
  atenuado?: boolean;
};

// Tile de selección con icono (104 pt de ancho). Selected = estado activo
// (amarillo), Danger = seguridad/urgencia (rojo).
export function Tile({ label, icon, state = "default", onPress, fill = false, atenuado = false }: TileProps) {
  const color = state === "danger" ? colors.red : colors.ink;

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
      {icon != null && withIconDefaults(icon, { color, size: sizes.tileIcon })}
      <Text style={[typography.caption, styles.label, { color }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: sizes.tileWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: sizes.tilePaddingY,
    gap: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    alignItems: "center",
  },
  fill: {
    flex: 1,
    width: undefined,
    paddingHorizontal: spacing.xxs,
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

const containerStyles = StyleSheet.create({
  default: {
    backgroundColor: colors.surface,
    borderColor: colors.ink,
  },
  selected: {
    backgroundColor: colors.yellow,
    borderColor: colors.ink,
  },
  danger: {
    backgroundColor: colors.surface,
    borderColor: colors.red,
  },
});
