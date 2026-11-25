import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CircleAlert } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useEstilos, useTema } from "@/context/TemaContext";
import { Button, Chip, IconButton, Mapa, Toggle } from "@/components";
import { VENTANAS_SEGURIDAD_H } from "@/config/reportes";
import { usePreferencias } from "@/context/PreferenciasContext";
import { getUbicacionUsuario, getZonasSeguridad } from "@/data/repositorio";
import { radii, sizes, spacing, type Tema, type Paleta } from "@/theme";
import type { Coordenada, NivelZona, TipoSeguridad, ZonaSeguridad } from "@/types";
import { cantidadReportes, haceCuanto, seguridadEnFrase } from "@/utils/formato";

// Filtros por lo que pasó (los mismos tipos que se reportan en F2_07)
const FILTROS: { valor: TipoSeguridad | null; label: string }[] = [
  { valor: null, label: "Todo" },
  { valor: "robo", label: "Robos" },
  { valor: "acoso", label: "Acoso" },
  { valor: "paradero_peligroso", label: "Paradero peligroso" },
  { valor: "conductor_imprudente", label: "Conductor imprudente" },
];

// Leyenda: punto de color + texto (el nivel nunca depende solo del color)
const leyenda = (colors: Paleta): { label: string; color: string }[] => [
  { label: "Alto", color: colors.red },
  { label: "Medio", color: colors.amber },
  { label: "Sin reportes", color: colors.inkMuted },
];

const CHIP_NIVEL: Record<NivelZona, { label: string; state: "alert" | "default" }> = {
  alto: { label: "Zona roja", state: "alert" },
  medio: { label: "Zona media", state: "default" }, // supuesto: Figma solo muestra la roja
};

// undefined = cargando; null = error
type Estado = ZonaSeguridad[] | null | undefined;

// F3_06 · Mapa de seguridad: reportes de seguridad recientes agrupados por
// paradero. Desde el chip Seguridad de Inicio, el menú lateral o un aviso de
// seguridad (param `paraderoId`: la hoja muestra ese paradero).
export default function Seguridad() {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { paraderoId } = useLocalSearchParams<{ paraderoId?: string }>();
  const { ajustes, cambiarAjuste } = usePreferencias();

  const [horas, setHoras] = useState<number>(VENTANAS_SEGURIDAD_H[0]);
  const [tipo, setTipo] = useState<TipoSeguridad | null>(null);
  const [zonas, setZonas] = useState<Estado>();
  const [usuario, setUsuario] = useState<Coordenada>();

  const [altoArriba, setAltoArriba] = useState(0);
  const [altoAbajo, setAltoAbajo] = useState(0);
  const alto = (setter: (valor: number) => void) => (e: LayoutChangeEvent) => setter(e.nativeEvent.layout.height);

  useEffect(() => {
    getUbicacionUsuario()
      .then(setUsuario)
      .catch(() => {});
  }, []);

  const pedirZonas = useCallback(() => {
    let activo = true;
    getZonasSeguridad(horas, tipo ?? undefined)
      .then((data) => activo && setZonas(data))
      .catch(() => activo && setZonas(null));
    return () => {
      activo = false;
    };
  }, [horas, tipo]);

  useEffect(pedirZonas, [pedirZonas]);

  const cambiarFiltro = (valor: TipoSeguridad | null) => {
    setZonas(undefined);
    setTipo(valor);
  };

  // Alterna 2 h → 6 h → 24 h → 2 h
  const cambiarVentana = () => {
    const i = VENTANAS_SEGURIDAD_H.indexOf(horas as (typeof VENTANAS_SEGURIDAD_H)[number]);
    setZonas(undefined);
    setHoras(VENTANAS_SEGURIDAD_H[(i + 1) % VENTANAS_SEGURIDAD_H.length]);
  };

  const reintentar = () => {
    setZonas(undefined);
    pedirZonas();
  };

  const total = zonas?.reduce((suma, z) => suma + z.cantidad, 0) ?? 0;
  const destacada = zonas ? (zonas.find((z) => z.paradero.id === paraderoId) ?? zonas[0]) : undefined;

  return (
    <View style={styles.screen}>
      <Mapa
        estilo={StyleSheet.absoluteFill}
        usuario={usuario}
        paraderos={destacada ? [destacada.paradero] : []}
        zonas={(zonas ?? []).map((z) => ({ id: z.paradero.id, lat: z.paradero.lat, lng: z.paradero.lng, nivel: z.nivel }))}
        margen={{ top: altoArriba, bottom: altoAbajo }}
      />

      <SafeAreaView style={styles.capa} edges={["left", "right"]} pointerEvents="box-none">
        <View style={{ paddingTop: insets.top + spacing.sm }} onLayout={alto(setAltoArriba)}>
          <View style={styles.header}>
            <IconButton icon={<ArrowLeft />} accessibilityLabel="Volver" onPress={() => router.back()} />
            <View style={styles.titulo}>
              <Text style={[typography.title, styles.ink]} accessibilityRole="header" numberOfLines={1}>
                Seguridad comunitaria
              </Text>
              <Text style={[typography.caption, styles.muted]} numberOfLines={1}>
                Últimas {horas} horas{zonas ? ` · ${cantidadReportes(total)}` : ""}
              </Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
            {FILTROS.map(({ valor, label }) => (
              <Chip
                key={label}
                label={label}
                state={tipo === valor ? "selected" : "default"}
                onPress={() => cambiarFiltro(valor)}
              />
            ))}
            <Chip label={`${horas} h ▾`} onPress={cambiarVentana} />
          </ScrollView>
        </View>

        <View onLayout={alto(setAltoAbajo)}>
          <View style={styles.acciones} pointerEvents="box-none">
            <View>
              <Button
                label="Reportar"
                variant="danger"
                pill
                icon={<CircleAlert />}
                onPress={() => router.push("/reporte/seguridad")}
              />
            </View>
            <View style={styles.leyenda} accessibilityLabel="Leyenda: rojo alto, ámbar medio, gris sin reportes">
              {leyenda(colors).map(({ label, color }) => (
                <View key={label} style={styles.leyendaFila}>
                  <View style={[styles.leyendaPunto, { backgroundColor: color }]} />
                  <Text style={[typography.caption, styles.ink]}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.hoja, { paddingBottom: spacing.lg + insets.bottom }]}>
            <View style={styles.grabber} />
            <Hoja zona={destacada} estado={zonas} horas={horas} onReintentar={reintentar} />
            <View style={styles.fila}>
              <Text style={[typography.bodyStrong, styles.ink, styles.flex]}>Evitar zonas rojas en mis rutas</Text>
              <Toggle
                value={ajustes.evitarZonasRojas}
                onValueChange={(v) => cambiarAjuste("evitarZonasRojas", v)}
                accessibilityLabel="Evitar zonas rojas en mis rutas"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// Paradero con más reportes (o el del aviso), vacío o error
function Hoja({
  zona,
  estado,
  horas,
  onReintentar,
}: {
  zona: ZonaSeguridad | undefined;
  estado: Estado;
  horas: number;
  onReintentar: () => void;
}) {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  if (estado === undefined) {
    return <ActivityIndicator color={colors.ink} style={styles.cargando} />;
  }

  if (estado === null) {
    return (
      <View style={styles.fila}>
        <Text style={[typography.caption, styles.muted, styles.flex]}>
          No pudimos cargar los reportes de seguridad. Revisa tu conexión e inténtalo otra vez.
        </Text>
        <Button label="Reintentar" variant="tertiary" onPress={onReintentar} />
      </View>
    );
  }

  if (!zona) {
    return (
      <View style={styles.texto}>
        <Text style={[typography.bodyStrong, styles.ink]}>Sin reportes de seguridad</Text>
        <Text style={[typography.caption, styles.muted]}>
          Nadie reportó problemas en las últimas {horas} horas con este filtro.
        </Text>
      </View>
    );
  }

  const chip = CHIP_NIVEL[zona.nivel];
  return (
    <View style={styles.fila}>
      <View style={[styles.texto, styles.flex]}>
        <Text style={[typography.bodyStrong, styles.ink]} numberOfLines={1}>
          {zona.paradero.nombre}
        </Text>
        <Text style={[typography.caption, styles.muted]}>
          {cantidadReportes(zona.cantidad)} de {seguridadEnFrase(zona.tipoFrecuente)} · último {haceCuanto(zona.ultimo)}
        </Text>
      </View>
      <Chip label={chip.label} state={chip.state} />
    </View>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.map,
    },
    capa: {
      flex: 1,
      justifyContent: "space-between",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    titulo: {
      flex: 1,
      gap: spacing.xxs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + spacing.xxs,
      borderRadius: radii.control,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    filtros: {
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    acciones: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    leyenda: {
      gap: spacing.xs,
      padding: sizes.legendPadding,
      borderRadius: radii.lg,
      backgroundColor: colors.canvas,
    },
    leyendaFila: {
      flexDirection: "row",
      alignItems: "center",
      gap: sizes.chipGap,
    },
    leyendaPunto: {
      width: sizes.legendDot,
      height: sizes.legendDot,
      borderRadius: radii.pill,
    },
    hoja: {
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
      backgroundColor: colors.surface,
      ...shadows.sheet,
    },
    grabber: {
      alignSelf: "center",
      width: sizes.grabberWidth,
      height: sizes.grabberHeight,
      borderRadius: radii.pill,
      backgroundColor: colors.line,
    },
    fila: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    texto: {
      gap: spacing.xxs,
    },
    flex: {
      flex: 1,
    },
    cargando: {
      alignSelf: "flex-start",
      marginVertical: spacing.sm,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
  });
