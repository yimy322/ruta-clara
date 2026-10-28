import { Pressable, StyleSheet, Text } from "react-native";

import { borderWidths, colors, opacity, sizes, spacing, typography } from "@/theme";

type OpcionGrandeProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

// Opción de 48 pt a todo el ancho, para elegir una entre pocas (p. ej. el
// tiempo de espera en F2_05). La elegida va en ink con texto blanco.
export function OpcionGrande({ label, selected = false, onPress }: OpcionGrandeProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.base, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[typography.bodyStrong, selected ? styles.labelSelected : styles.label]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.optionHeight,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: sizes.optionRadius,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  selected: {
    backgroundColor: colors.ink,
  },
  label: {
    color: colors.ink,
  },
  labelSelected: {
    color: colors.surface,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
