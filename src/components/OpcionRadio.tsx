import { Pressable, StyleSheet, Text, View } from "react-native";

import { borderWidths, colors, opacity, radii, shadows, sizes, spacing, typography } from "@/theme";

type OpcionRadioProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

// Opción de 56 pt con radio, para elegir una entre varias (p. ej. qué pasó
// en F2_07). Tarjeta con sombra; la elegida va en rojo suave con borde rojo
// y el radio relleno en rojo.
export function OpcionRadio({ label, selected = false, onPress }: OpcionRadioProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.base, selected && styles.selected, pressed && styles.pressed]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.punto} />}
      </View>
      <Text style={[typography.bodyStrong, styles.label]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.optionHeightLarge,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.control,
    // Borde transparente para que la elegida no cambie de tamaño
    borderWidth: borderWidths.medium,
    borderColor: "transparent",
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  selected: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  radio: {
    width: sizes.radio,
    height: sizes.radio,
    borderRadius: radii.pill,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    backgroundColor: colors.red,
  },
  punto: {
    width: sizes.radioDot,
    height: sizes.radioDot,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  label: {
    flex: 1,
    color: colors.ink,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
