import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { borderWidths, colors, minTouch, opacity, radii, sizes, spacing, typography } from "@/theme";
import { withIconDefaults } from "@/utils/icons";

export type ChipState = "default" | "selected" | "live" | "alert";

type ChipProps = {
  label: string;
  state?: ChipState;
  icon?: ReactNode;
  onPress?: () => void;
};

// Extiende el área táctil del chip (32 pt) hasta 44 pt
const verticalSlop = (minTouch - sizes.chipHeight) / 2;
const hitSlop = { top: verticalSlop, bottom: verticalSlop };

// Chip 32 pt. Live = unidad en vivo (amarillo), Alert = seguridad (rojo).
export function Chip({ label, state = "default", icon, onPress }: ChipProps) {
  const content = (
    <>
      {icon != null && withIconDefaults(icon, { color: labelStyles[state].color, size: sizes.chipIcon })}
      <Text style={[typography.caption, labelStyles[state]]} numberOfLines={1}>
        {label}
      </Text>
    </>
  );

  if (!onPress) {
    return <View style={[styles.base, containerStyles[state]]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityState={{ selected: state === "selected" }}
      style={({ pressed }) => [
        styles.base,
        containerStyles[state],
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.chipHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: borderWidths.thin,
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  pressed: {
    opacity: opacity.pressed,
  },
});

// Selected no tiene borde en Figma; se usa el mismo color del fondo para
// que el chip no cambie de tamaño al seleccionarlo.
const containerStyles = StyleSheet.create({
  default: {
    backgroundColor: colors.surface,
    borderColor: colors.ink,
  },
  selected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  live: {
    backgroundColor: colors.yellow,
    borderColor: colors.ink,
  },
  alert: {
    backgroundColor: colors.redSoft,
    borderColor: colors.red,
  },
});

const labelStyles = StyleSheet.create({
  default: { color: colors.ink },
  selected: { color: colors.surface },
  live: { color: colors.ink },
  alert: { color: colors.red },
});
