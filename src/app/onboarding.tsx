import * as Location from "expo-location";
import { LocateFixed } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Paginador } from "@/components";
import { usePreferencias } from "@/context/PreferenciasContext";
import { borderWidths, colors, minTouch, opacity, radii, sizes, spacing, typography } from "@/theme";

const ilustracionRutas = require("../../assets/images/onboarding-1.png");
const ilustracionReportes = require("../../assets/images/onboarding-2.png");

const TOTAL_PAGINAS = 2;

// F1_02 · Onboarding 1 y F1_03 · Onboarding 2, en páginas deslizables
export default function Onboarding() {
  const { width } = useWindowDimensions();
  const { completarOnboarding } = usePreferencias();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [pagina, setPagina] = useState(0);
  const [enviando, setEnviando] = useState(false);

  const irA = (indice: number) => scrollRef.current?.scrollTo({ x: indice * width, animated: true });

  // El paginador sigue a la página visible también al deslizar con el dedo
  const alDeslizar = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const visible = Math.round(e.nativeEvent.contentOffset.x / width);
    if (visible !== pagina) {
      setPagina(visible);
    }
  };

  // Se entra a Inicio se acepte o no el permiso
  const permitirYEmpezar = async () => {
    setEnviando(true);
    try {
      await Location.requestForegroundPermissionsAsync();
    } finally {
      await completarOnboarding();
    }
  };

  const ahoraNo = async () => {
    setEnviando(true);
    await completarOnboarding();
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={alDeslizar}
        scrollEventThrottle={16}
      >
        {/* F1_02 */}
        <View style={[styles.pagina, { width }]}>
          <View style={[styles.barra, styles.barraDerecha]}>
            <Enlace label="Saltar" onPress={() => irA(1)} />
          </View>
          <View style={styles.contenido}>
            <Ilustracion source={ilustracionRutas} alto={sizes.onboardingArt} />
            <Text style={styles.titulo}>Conoce rutas de combis, custer y micros que otros no muestran</Text>
            <Text style={styles.subtitulo}>Más de 400 líneas mapeadas por los mismos pasajeros.</Text>
            <View style={styles.spacer} />
            <View style={styles.filaSiguiente}>
              <Paginador total={TOTAL_PAGINAS} activo={pagina} />
              <Button label="Siguiente →" onPress={() => irA(1)} />
            </View>
          </View>
        </View>

        {/* F1_03 */}
        <View style={[styles.pagina, { width }]}>
          <View style={styles.barra}>
            <Enlace label="← Atrás" onPress={() => irA(0)} />
          </View>
          <View style={styles.contenido}>
            <Ilustracion source={ilustracionReportes} alto={sizes.onboardingArtCompact} />
            <Text style={styles.titulo}>Reporta y entérate en vivo dónde viene tu carro y el tráfico</Text>
            <View style={styles.prePermiso}>
              <View style={styles.prePermisoIcono}>
                <LocateFixed color={colors.ink} size={sizes.chipIcon} />
              </View>
              <Text style={styles.prePermisoTexto}>
                Usamos tu ubicación para mostrarte paraderos y combis cerca.
              </Text>
            </View>
            <View style={styles.spacer} />
            <View style={styles.paginadorCentrado}>
              <Paginador total={TOTAL_PAGINAS} activo={pagina} />
            </View>
            <Button
              label="Permitir ubicación y empezar"
              onPress={permitirYEmpezar}
              disabled={enviando}
              fullWidth
            />
            <Button label="Ahora no" variant="tertiary" onPress={ahoraNo} disabled={enviando} fullWidth />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Enlace({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.enlace, pressed && styles.pressed]}
    >
      <Text style={styles.enlaceTexto}>{label}</Text>
    </Pressable>
  );
}

function Ilustracion({ source, alto }: { source: number; alto: number }) {
  return (
    <View style={[styles.ilustracion, { height: alto }]}>
      <Image source={source} style={styles.ilustracionImagen} resizeMode="cover" accessibilityIgnoresInvertColors />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  pagina: {
    flex: 1,
  },
  barra: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
  },
  barraDerecha: {
    justifyContent: "flex-end",
  },
  enlace: {
    minHeight: minTouch,
    justifyContent: "center",
  },
  enlaceTexto: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  contenido: {
    flex: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  ilustracion: {
    overflow: "hidden",
    borderRadius: radii.art,
    borderWidth: borderWidths.thin,
    borderStyle: "dashed",
    borderColor: colors.line,
  },
  ilustracionImagen: {
    width: "100%",
    height: "100%",
  },
  titulo: {
    ...typography.h1,
    color: colors.ink,
  },
  subtitulo: {
    ...typography.body,
    color: colors.inkMuted,
  },
  spacer: {
    flex: 1,
  },
  filaSiguiente: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paginadorCentrado: {
    alignItems: "center",
  },
  prePermiso: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: sizes.cardPadding,
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  prePermisoIcono: {
    width: sizes.prePermisoIcon,
    height: sizes.prePermisoIcon,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
  },
  prePermisoTexto: {
    ...typography.caption,
    flex: 1,
    color: colors.ink,
  },
});
