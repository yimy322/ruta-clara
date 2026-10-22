import { Pressable, StyleSheet, View } from "react-native";

import { borderWidths, colors, minTouch, opacity, radii, sizes } from "@/theme";

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
};

// Extiende el área táctil (26 pt de alto) hasta 44 pt
const verticalSlop = (minTouch - sizes.toggleHeight) / 2;
const hitSlop = { top: verticalSlop, bottom: verticalSlop };

// Interruptor on/off. On: pista negra con perilla blanca a la derecha.
// Off: pista blanca con borde y perilla negra a la izquierda.
export function Toggle({ value, onValueChange, accessibilityLabel }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      hitSlop={hitSlop}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      style={({ pressed }) => [
        styles.track,
        value ? styles.trackOn : styles.trackOff,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: sizes.toggleWidth,
    height: sizes.toggleHeight,
    borderRadius: radii.pill,
    borderWidth: borderWidths.strong,
    justifyContent: "center",
    paddingHorizontal: sizes.toggleInset - borderWidths.strong,
  },
  trackOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
    alignItems: "flex-end",
  },
  trackOff: {
    backgroundColor: colors.surface,
    borderColor: colors.ink,
    alignItems: "flex-start",
  },
  knob: {
    width: sizes.toggleKnob,
    height: sizes.toggleKnob,
    borderRadius: radii.pill,
  },
  knobOn: {
    backgroundColor: colors.surface,
  },
  knobOff: {
    backgroundColor: colors.ink,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
