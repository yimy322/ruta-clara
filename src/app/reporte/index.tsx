import { useRouter, type Href } from "expo-router";
import { MapPin, ShieldAlert, Split, TrafficCone, Users, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, Mapa, Tile } from "@/components";
import { CALLE_USUARIO } from "@/config/simulacion";
import { useReporte } from "@/context/ReporteContext";
import { getParaderoCercano, getUbicacionUsuario } from "@/data/repositorio";
import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
import type { BorradorReporte, Coordenada, Paradero } from "@/types";

// F2_01 · Panel de reporte rápido
export default function PanelReporte() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reiniciar, actualizar, cerrar } = useReporte();

  const [ubicacion, setUbicacion] = useState<Coordenada>();
  const [paradero, setParadero] = useState<Paradero | null>();

  useEffect(() => {
    let activo = true;
    (async () => {
      const coordenada = await getUbicacionUsuario();
      if (!activo) {
        return;
      }
      setUbicacion(coordenada);
      const cercano = await getParaderoCercano(coordenada.lat, coordenada.lng);
      if (activo) {
        setParadero(cercano);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  // Cada opción empieza un borrador nuevo
  const empezar = (cambios: Partial<BorradorReporte>, paso: Href) => {
    reiniciar();
    actualizar(cambios);
    router.push(paso);
  };

  return (
    <View style={styles.screen}>
      <Mapa estilo={StyleSheet.absoluteFill} usuario={ubicacion} />

      <SafeAreaView style={styles.capa} edges={["left", "right"]}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.grabber} />

          <View style={styles.encabezado}>
            <View style={styles.titulos}>
              <Text style={[typography.h2, styles.ink]} accessibilityRole="header">
                ¿Qué quieres reportar?
              </Text>
              <Text style={[typography.caption, styles.muted]} numberOfLines={1}>
                {paradero ? `${CALLE_USUARIO} · ${paradero.nombre}` : CALLE_USUARIO}
              </Text>
            </View>
            <IconButton icon={<X />} accessibilityLabel="Cerrar" onPress={cerrar} />
          </View>

          <View style={styles.fila}>
            <Tile
              label="Ubicación de combi"
              icon={<MapPin />}
              state="selected"
              fill
              onPress={() => empezar({ tipo: "ubicacion", modo: "ubicacion" }, "/reporte/linea")}
            />
            <Tile
              label="Tránsito pesado"
              icon={<TrafficCone />}
              fill
              onPress={() => empezar({ tipo: "transito" }, "/reporte/transito")}
            />
          </View>
          <View style={styles.fila}>
            <Tile
              label="Paradero lleno"
              icon={<Users />}
              fill
              onPress={() => empezar({ tipo: "paradero" }, "/reporte/paradero")}
            />
            <Tile
              label="Desvío de ruta"
              icon={<Split />}
              fill
              onPress={() => empezar({ tipo: "desvio", modo: "desvio" }, "/reporte/linea")}
            />
          </View>
          <View style={styles.fila}>
            <Tile
              label="Seguridad / Peligro"
              icon={<ShieldAlert />}
              state="danger"
              fill
              onPress={() => empezar({ tipo: "seguridad" }, "/reporte/seguridad")}
            />
          </View>

          <Text style={[typography.caption, styles.muted, styles.nota]}>Tus reportes se publican sin tu nombre</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.map,
  },
  capa: {
    flex: 1,
    justifyContent: "flex-end",
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
  encabezado: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  titulos: {
    flex: 1,
    gap: spacing.xxs,
  },
  fila: {
    flexDirection: "row",
    gap: spacing.md,
  },
  nota: {
    textAlign: "center",
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
});
