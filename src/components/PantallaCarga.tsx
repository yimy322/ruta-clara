import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radii, sizes, spacing, typography } from "@/theme";

const isotipo = require("../../assets/images/isotipo.png");

const DURACION_BARRIDO_MS = 1200;

// F1_01 · Splash / Carga. La muestra el layout raíz mientras cargan las
// fuentes y las preferencias locales; no es una ruta.
export function PantallaCarga() {
  const avance = useSharedValue(0);

  useEffect(() => {
    avance.value = withRepeat(
      withTiming(1, { duration: DURACION_BARRIDO_MS, easing: Easing.inOut(Easing.quad) }),
      -1,
    );
  }, [avance]);

  // El relleno entra por la izquierda y sale por la derecha del riel
  const rellenoStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: -sizes.progressFill + avance.value * (sizes.progressTrack + sizes.progressFill),
      },
    ],
  }));

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.spacer} />
      <Image source={isotipo} style={styles.isotipo} accessibilityIgnoresInvertColors />
      <Text style={styles.marca}>RutaClara</Text>
      <Text style={styles.slogan}>Muévete seguro y a tiempo en Lima</Text>
      <View style={styles.spacer} />
      <View
        style={styles.riel}
        accessibilityRole="progressbar"
        accessibilityLabel="Cargando rutas de Lima"
      >
        <Animated.View style={[styles.relleno, rellenoStyle]} />
      </View>
      <Text style={styles.cargando}>Cargando rutas de Lima…</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    backgroundColor: colors.ink,
  },
  spacer: {
    flex: 1,
  },
  isotipo: {
    width: sizes.isotipo,
    height: sizes.isotipo,
    borderRadius: radii.xxl,
  },
  marca: {
    ...typography.display,
    color: colors.surface,
    textAlign: "center",
  },
  slogan: {
    ...typography.body,
    color: colors.line,
    textAlign: "center",
  },
  riel: {
    width: sizes.progressTrack,
    height: sizes.progressHeight,
    borderRadius: radii.pill,
    overflow: "hidden",
    backgroundColor: colors.inkMuted,
  },
  relleno: {
    width: sizes.progressFill,
    height: sizes.progressHeight,
    borderRadius: radii.pill,
    backgroundColor: colors.yellow,
  },
  cargando: {
    ...typography.caption,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
