import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { borderWidths, minTouch, opacity, radii, sizes, type Tema } from "@/theme";
import { withIconDefaults } from "@/utils/icons";

export type ChipState = "default" | "selected" | "live" | "alert";

type ChipProps = {
  label: string;
  state?: ChipState;
  // Ícono opcional de lucide-react-native (16 pt)
  icon?: ReactNode;
  onPress?: () => void;
};

// Extiende el área táctil del chip (32 pt) hasta 44 pt
const verticalSlop = (minTouch - sizes.chipHeight) / 2;
const hitSlop = { top: verticalSlop, bottom: verticalSlop };

// Chip píldora de 32 pt (Figma 69:459). Live = unidad en vivo (amarillo),
// Alert = seguridad (rojo).
export function Chip({ label, state = "default", icon, onPress }: ChipProps) {
  const { typography } = useTema();
  const containerStyles = useEstilos(crearContainerStyles);
  const labelStyles = useEstilos(crearLabelStyles);

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
      style={({ pressed }) => [styles.base, containerStyles[state], pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.chipHeight,
    paddingHorizontal: sizes.chipPaddingX,
    borderRadius: radii.pill,
    borderWidth: borderWidths.thin,
    flexDirection: "row",
    gap: sizes.chipGap,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  pressed: {
    opacity: opacity.pressed,
  },
});

// Solo Default lleva borde en Figma; en los demás el borde es transparente
// para que el chip no cambie de tamaño al seleccionarlo.
const crearContainerStyles = ({ colors }: Tema) =>
  StyleSheet.create({
    default: {
      backgroundColor: colors.surface,
      borderColor: colors.line,
    },
    selected: {
      backgroundColor: colors.ink,
      borderColor: "transparent",
    },
    live: {
      backgroundColor: colors.yellow,
      borderColor: "transparent",
    },
    alert: {
      backgroundColor: colors.redSoft,
      borderColor: "transparent",
    },
  });

const crearLabelStyles = ({ colors }: Tema) =>
  StyleSheet.create({
    default: { color: colors.ink },
    selected: { color: colors.surface },
    // Sobre amarillo el texto es siempre oscuro, también en el tema oscuro
    live: { color: colors.onYellow },
    alert: { color: colors.redStrong },
  });
