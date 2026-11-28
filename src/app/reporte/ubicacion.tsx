import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useEstilos, useTema } from "@/context/TemaContext";
import { Button, Chip, IconButton, Mapa, PinUnidad, Toggle } from "@/components";
import { CALLE_USUARIO, PRECISION_GPS_M } from "@/config/simulacion";
import { useReporte } from "@/context/ReporteContext";
import { getLinea, getParaderoCercano, getUbicacionUsuario } from "@/data/repositorio";
import { useEnviarReporte } from "@/hooks/useEnviarReporte";
import { borderWidths, radii, sizes, spacing, type Tema } from "@/theme";
import type { Coordenada, Linea, Paradero } from "@/types";
import { etiquetaOcupacion, etiquetaVelocidad } from "@/utils/formato";

// F2_04 · Confirmar ubicación (paso 3 de 3)
export default function ConfirmarUbicacion() {
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { borrador, actualizar } = useReporte();

  const [linea, setLinea] = useState<Linea | null>();
  const [paradero, setParadero] = useState<Paradero | null>();
  // Centro con el que abre el mapa: lo ya elegido o la ubicación del usuario
  const [inicio, setInicio] = useState<Coordenada>();
  const { enviar, enviando } = useEnviarReporte();

  useEffect(() => {
    if (!borrador.lineaId) {
      return;
    }
    let activo = true;
    getLinea(borrador.lineaId).then((encontrada) => activo && setLinea(encontrada));
    return () => {
      activo = false;
    };
  }, [borrador.lineaId]);

  // Se lee una vez al abrir; después el mapa se mueve bajo el pin fijo
  const posicionInicial = useRef(borrador.posicion);
  useEffect(() => {
    let activo = true;
    (async () => {
      const centro = posicionInicial.current ?? (await getUbicacionUsuario());
      if (activo) {
        setInicio(centro);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  // El centro del mapa es la posición del reporte; la dirección es la del paradero más cercano
  useEffect(() => {
    let activo = true;
    (async () => {
      const { lat, lng } = borrador.posicion ?? (await getUbicacionUsuario());
      const cercano = await getParaderoCercano(lat, lng);
      if (activo) {
        setParadero(cercano);
      }
    })();
    return () => {
      activo = false;
    };
  }, [borrador.posicion]);

  const aBordo = borrador.enUnidad === "a_bordo";
  const enVivo = aBordo && borrador.compartirEnVivo;

  return (
    <View style={styles.screen}>
      {inicio && (
        <Mapa estilo={StyleSheet.absoluteFill} centro={inicio} alMover={(posicion) => actualizar({ posicion })} />
      )}

      <SafeAreaView style={styles.arriba} edges={["top", "left", "right"]}>
        <IconButton icon={<ArrowLeft />} accessibilityLabel="Volver" onPress={() => router.back()} />
        <View style={styles.paso}>
          <Text style={[typography.overline, styles.muted]}>Paso 3 de 3</Text>
          <Text style={[typography.captionStrong, styles.ink]} accessibilityRole="header">
            Confirma dónde está
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.centro} pointerEvents="none">
        {linea && <PinUnidad etiqueta={linea.nombre} pista="arrastra el mapa para ajustar" />}
      </View>

      <SafeAreaView edges={["left", "right"]}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.grabber} />

          <View style={styles.direccion}>
            <Text style={[typography.bodyStrong, styles.ink]} numberOfLines={1}>
              {paradero?.direccion ?? CALLE_USUARIO}
            </Text>
            <Text style={[typography.caption, styles.muted]} numberOfLines={1}>
              {paradero ? `Precisión GPS ±${PRECISION_GPS_M} m · ${paradero.distrito}` : `Precisión GPS ±${PRECISION_GPS_M} m`}
            </Text>
          </View>

          <View style={styles.chips}>
            {linea && <Chip label={linea.nombre} />}
            {borrador.ocupacion && <Chip label={etiquetaOcupacion(borrador.ocupacion)} />}
            {borrador.velocidad && <Chip label={etiquetaVelocidad(borrador.velocidad)} />}
            <Chip label="Editar" onPress={() => router.back()} />
          </View>

          {aBordo && (
            <View style={styles.compartir}>
              <View style={styles.compartirTexto}>
                <Text style={[typography.bodyStrong, styles.ink]}>Compartir en tiempo real</Text>
                <Text style={[typography.caption, styles.muted]}>Mientras vas a bordo · se apaga a los 30 min</Text>
              </View>
              <Toggle
                value={borrador.compartirEnVivo}
                onValueChange={(valor) => actualizar({ compartirEnVivo: valor })}
                accessibilityLabel="Compartir en tiempo real"
              />
            </View>
          )}

          <Button
            label={enviando ? "Enviando…" : enVivo ? "Confirmar y enviar en tiempo real" : "Confirmar y enviar"}
            onPress={() => enviar({ ...borrador, compartirEnVivo: enVivo })}
            disabled={enviando}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.map,
    },
    arriba: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    paso: {
      flex: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: sizes.stepPillPaddingY,
      borderRadius: radii.control,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    centro: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    sheet: {
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
      borderWidth: borderWidths.regular,
      borderBottomWidth: 0,
      borderColor: colors.ink,
      backgroundColor: colors.surface,
    },
    grabber: {
      alignSelf: "center",
      width: sizes.grabberWidth,
      height: sizes.grabberHeight,
      borderRadius: radii.pill,
      backgroundColor: colors.line,
    },
    direccion: {
      gap: spacing.xxs,
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    compartir: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical: spacing.xs,
    },
    compartirTexto: {
      flex: 1,
      gap: spacing.xxs,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
  });
