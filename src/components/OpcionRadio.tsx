import { Pressable, StyleSheet, Text, View } from "react-native";

import { borderWidths, colors, opacity, radii, sizes, spacing, typography } from "@/theme";

type OpcionRadioProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

// Opción de 56 pt con radio, para elegir una entre varias (p. ej. qué pasó
// en F2_07). La elegida lleva borde grueso y el radio en rojo.
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
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  selected: {
    borderWidth: borderWidths.thick,
  },
  radio: {
    width: sizes.radio,
    height: sizes.radio,
    borderRadius: radii.pill,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.red,
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
