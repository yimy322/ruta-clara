import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View, type AccessibilityActionEvent } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { radii, sizes, type Tema } from "@/theme";

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
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);

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
      // La sombra va afuera: el botón recorta el relleno con overflow hidden
      style={styles.sombra}
    >
      <View style={styles.base}>
        <Animated.View style={[styles.relleno, { width: ancho }]} />
        <Text style={[typography.button, styles.label]} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    sombra: {
      alignSelf: "stretch",
      borderRadius: radii.control,
      ...shadows.danger,
    },
    base: {
      // Altura mínima: con texto grande (hasta 200 %) el control crece en vez de cortar el texto
      minHeight: sizes.buttonHeight,
      paddingHorizontal: sizes.buttonPaddingX,
      borderRadius: radii.control,
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
      textAlign: "center",
      color: colors.surface,
    },
  });
