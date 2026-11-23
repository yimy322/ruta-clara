import { Pressable, StyleSheet, View } from "react-native";

import { colors, minTouch, opacity, radii, shadows, sizes } from "@/theme";

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
};

// Extiende el área táctil (26 pt de alto) hasta 44 pt
const verticalSlop = (minTouch - sizes.toggleHeight) / 2;
const hitSlop = { top: verticalSlop, bottom: verticalSlop };

// Interruptor on/off (Figma 69:469). On: pista ink con perilla blanca a la
// derecha. Off: pista controlOff (3,3:1) con perilla blanca a la izquierda.
export function Toggle({ value, onValueChange, accessibilityLabel }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      hitSlop={hitSlop}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      style={({ pressed }) => [styles.track, value ? styles.trackOn : styles.trackOff, pressed && styles.pressed]}
    >
      <View style={styles.knob} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: sizes.toggleWidth,
    height: sizes.toggleHeight,
    borderRadius: radii.pill,
    justifyContent: "center",
    paddingHorizontal: sizes.toggleInset,
  },
  trackOn: {
    backgroundColor: colors.ink,
    alignItems: "flex-end",
  },
  trackOff: {
    backgroundColor: colors.controlOff,
    alignItems: "flex-start",
  },
  knob: {
    width: sizes.toggleKnob,
    height: sizes.toggleKnob,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
