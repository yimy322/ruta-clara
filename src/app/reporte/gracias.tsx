import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Animated, BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BarraProgreso, Button } from "@/components";
import { useReporte } from "@/context/ReporteContext";
import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
import { formatearPuntos } from "@/utils/formato";
import { calcularRango } from "@/utils/gamificacion";

const CIERRE_AUTOMATICO_S = 5;
const ESCALA_INICIAL = 0.6;

type Params = {
  puntos: string;
  total: string;
  personas: string;
};

// F2_08 · Confirmación y agradecimiento. Recibe el resultado de crearReporte
// por params, porque también se abre desde F1_10 (fuera del ReporteProvider
// del flujo de reporte).
export default function Gracias() {
  const router = useRouter();
  const { cerrar, reiniciar } = useReporte();
  const params = useLocalSearchParams<Params>();

  const puntos = Number(params.puntos);
  const total = Number(params.total);
  const personas = Number(params.personas);
  const valido = [puntos, total, personas].every(Number.isFinite);

  // null cuando el usuario canceló el cierre automático
  const [segundos, setSegundos] = useState<number | null>(CIERRE_AUTOMATICO_S);
  const [escala] = useState(() => new Animated.Value(ESCALA_INICIAL));

  useEffect(() => {
    Animated.spring(escala, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [escala]);

  // Al salir, el siguiente reporte empieza de cero
  useEffect(() => reiniciar, [reiniciar]);

  // Sin resultado (p. ej. un enlace directo) no hay nada que mostrar
  useEffect(() => {
    if (!valido) {
      cerrar();
    }
  }, [valido, cerrar]);

  useEffect(() => {
    if (segundos === null || !valido) {
      return;
    }
    if (segundos === 0) {
      cerrar();
      return;
    }
    const timer = setTimeout(() => setSegundos((actual) => (actual === null ? null : actual - 1)), 1000);
    return () => clearTimeout(timer);
  }, [segundos, valido, cerrar]);

  // El reporte ya se envió: el botón atrás de Android cierra el modal en vez
  // de volver al paso anterior (en iOS el gesto se bloquea en el layout).
  useFocusEffect(
    useCallback(() => {
      const suscripcion = BackHandler.addEventListener("hardwareBackPress", () => {
        cerrar();
        return true;
      });
      return () => suscripcion.remove();
    }, [cerrar]),
  );

  if (!valido) {
    return null;
  }

  const { actual, siguiente, puntosFaltantes } = calcularRango(total);

  const verLogros = () => {
    cerrar();
    router.navigate("/perfil");
  };

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right", "bottom"]}
      onTouchStart={() => setSegundos(null)}
    >
      <ScrollView contentContainerStyle={styles.contenido}>
        <Animated.View style={[styles.halo, { transform: [{ scale: escala }] }]}>
          <View style={styles.exito}>
            <Check color={colors.ink} size={sizes.successGlyphLarge} strokeWidth={3} />
          </View>
        </Animated.View>

        <Text style={[typography.h1, styles.ink, styles.centrado]} accessibilityRole="header">
          ¡Gracias, colaboraste{"\n"}con la comunidad!
        </Text>
        <Text style={[typography.display, styles.ink]}>+{puntos} pts</Text>
        <Text style={[typography.caption, styles.muted]}>de Lima-Colaborador</Text>

        <View style={styles.card}>
          <View style={styles.cardFila}>
            <Text style={[typography.captionStrong, styles.ink]}>{actual.nombre}</Text>
            {siguiente && (
              <Text style={[typography.caption, styles.muted]}>
                {formatearPuntos(total)} / {formatearPuntos(siguiente.puntosMinimos)}
              </Text>
            )}
          </View>
          <BarraProgreso progreso={siguiente ? total / siguiente.puntosMinimos : 1} />
          <Text style={[typography.caption, styles.muted]}>
            {siguiente
              ? `Te faltan ${formatearPuntos(puntosFaltantes)} pts para “${siguiente.nombre}”`
              : "¡Llegaste al rango más alto!" /* supuesto */}
          </Text>
        </View>

        <Text style={[typography.caption, styles.muted, styles.centrado]}>
          Tu reporte ya lo ven <Text style={typography.captionStrong}>{personas} pasajeros</Text> cerca
        </Text>
      </ScrollView>

      <View style={styles.pie}>
        {segundos !== null && (
          <Text style={[typography.caption, styles.muted, styles.centrado]}>Volviendo en {segundos} s…</Text>
        )}
        <Button label="Volver al mapa" onPress={cerrar} fullWidth />
        <Button label="Ver mis logros" variant="secondary" onPress={verLogros} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  contenido: {
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  halo: {
    width: sizes.successHalo,
    height: sizes.successHalo,
    borderRadius: radii.pill,
    backgroundColor: colors.yellowSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  exito: {
    width: sizes.successIconLarge,
    height: sizes.successIconLarge,
    borderRadius: radii.pill,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    alignSelf: "stretch",
    gap: spacing.sm,
    padding: sizes.cardPadding,
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  cardFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  pie: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  centrado: {
    textAlign: "center",
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
});
