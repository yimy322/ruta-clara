import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { colors, opacity, radii, shadows, sizes } from "@/theme";
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

// Botón de ícono circular de 44 pt (Figma 73:1005) con sombra de tarjeta.
// Pensado para íconos de lucide-react-native: si el ícono no define color ni
// tamaño, se le asignan según el estado.
export function IconButton({ icon, onPress, active = false, tono, accessibilityLabel }: IconButtonProps) {
  const destacado = tono === "destacado";
  const color = active ? colors.surface : colors.ink;

  return (
    <Pressable
      onPress={onPress}
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
      {withIconDefaults(icon, { color, size: sizes.iconGlyph })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: sizes.iconButton,
    height: sizes.iconButton,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
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
