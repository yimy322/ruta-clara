import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { borderWidths, colors, minTouch, opacity, radii, sizes } from "@/theme";
import { withIconDefaults } from "@/utils/icons";

type IconButtonProps = {
  icon: ReactNode;
  onPress: () => void;
  active?: boolean;
  // Fondo amarillo: algo que el usuario marcó, como un favorito (F1_07, F3_02).
  // No confundir con Live, que es el amarillo de las unidades en vivo
  tono?: "destacado";
  accessibilityLabel: string;
};

// Extiende el área táctil del botón (36 pt) hasta 44 pt
const slop = (minTouch - sizes.iconButton) / 2;
const hitSlop = { top: slop, bottom: slop, left: slop, right: slop };

// Botón de icono 36 pt. Pensado para íconos de lucide-react-native: si el
// ícono no define color ni tamaño, se le asignan según el estado.
export function IconButton({ icon, onPress, active = false, tono, accessibilityLabel }: IconButtonProps) {
  const destacado = tono === "destacado";
  const color = active ? colors.surface : colors.ink;

  const content = withIconDefaults(icon, { color, size: sizes.iconGlyph });

  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active || destacado }}
      style={({ pressed }) => [
        styles.base,
        active && styles.active,
        destacado && styles.destacado,
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: sizes.iconButton,
    height: sizes.iconButton,
    borderRadius: radii.md,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    backgroundColor: colors.ink,
  },
  destacado: {
    backgroundColor: colors.yellow,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
