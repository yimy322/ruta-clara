import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { borderWidths, colors, minTouch, opacity, radii, sizes } from "@/theme";
import { withIconDefaults } from "@/utils/icons";

type IconButtonProps = {
  icon: ReactNode;
  onPress: () => void;
  active?: boolean;
  accessibilityLabel: string;
};

// Extiende el área táctil del botón (36 pt) hasta 44 pt
const slop = (minTouch - sizes.iconButton) / 2;
const hitSlop = { top: slop, bottom: slop, left: slop, right: slop };

// Botón de icono 36 pt. Pensado para íconos de lucide-react-native: si el
// ícono no define color ni tamaño, se le asignan según el estado.
export function IconButton({ icon, onPress, active = false, accessibilityLabel }: IconButtonProps) {
  const color = active ? colors.surface : colors.ink;

  const content = withIconDefaults(icon, { color, size: sizes.iconGlyph });

  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.base, active && styles.active, pressed && styles.pressed]}
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
  pressed: {
    opacity: opacity.pressed,
  },
});
