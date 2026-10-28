import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, type AccessibilityActionEvent } from "react-native";

import { colors, radii, sizes, typography } from "@/theme";

type BotonMantenerProps = {
  label: string;
  onCompletar: () => void;
  // Cuánto hay que mantenerlo presionado
  duracionMs?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

// Al soltar antes de tiempo, el relleno vuelve a cero así de rápido
const VUELTA_MS = 150;

// Botón rojo de urgencia (F2_07) que se activa manteniéndolo presionado: se
// va rellenando y, si se suelta antes, se cancela. Vibra leve al empezar y
// fuerte al completarse. Con lector de pantalla, la acción "activate" lo
// activa sin mantener presionado.
export function BotonMantener({
  label,
  onCompletar,
  duracionMs = 2000,
  accessibilityLabel,
  accessibilityHint,
}: BotonMantenerProps) {
  const [progreso] = useState(() => new Animated.Value(0));

  useEffect(() => () => progreso.stopAnimation(), [progreso]);

  const completar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    progreso.setValue(0);
    onCompletar();
  };

  const empezar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.timing(progreso, { toValue: 1, duration: duracionMs, useNativeDriver: false }).start(({ finished }) => {
      if (finished) {
        completar();
      }
    });
  };

  // Si ya se completó, el valor está en 0 y esto no hace nada
  const soltar = () => {
    progreso.stopAnimation();
    Animated.timing(progreso, { toValue: 0, duration: VUELTA_MS, useNativeDriver: false }).start();
  };

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === "activate") {
      completar();
    }
  };

  const ancho = progreso.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <Pressable
      onPressIn={empezar}
      onPressOut={soltar}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityActions={[{ name: "activate", label: accessibilityLabel ?? label }]}
      onAccessibilityAction={onAccessibilityAction}
      style={styles.base}
    >
      <Animated.View style={[styles.relleno, { width: ancho }]} />
      <Text style={[typography.button, styles.label]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.buttonHeight,
    paddingHorizontal: sizes.buttonPaddingX,
    borderRadius: radii.lg,
    backgroundColor: colors.red,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    overflow: "hidden",
  },
  relleno: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.redDeep,
  },
  label: {
    color: colors.surface,
  },
});
