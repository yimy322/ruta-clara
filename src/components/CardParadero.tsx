import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { opacity, radii, sizes, spacing, type Tema } from "@/theme";
import type { ActividadParadero, Paradero, ProximaUnidad } from "@/types";
import { etiquetaOcupacion, formatearDistancia, formatearEta, haceCuanto } from "@/utils/formato";

import { Chip } from "./Chip";

export type DatosCardParadero = {
  paradero: Paradero;
  distanciaM: number;
  actividad: ActividadParadero;
  // Próximas unidades, de la que llega primero a la última (getResumenParadero)
  proximas: ProximaUnidad[];
};

// Unidades que se muestran en la card (F1_04 muestra 2)
const PROXIMAS_VISIBLES = 2;

type CardParaderoProps = {
  // null mientras se cargan los datos
  datos: DatosCardParadero | null;
  onPress: (paraderoId: string) => void;
};

// "3 reportes activos · hace 4 min"
function textoReportes({ reportesActivos, ultimoReporte }: ActividadParadero) {
  if (reportesActivos === 0) {
    return "Sin reportes activos";
  }
  const cantidad = `${reportesActivos} ${reportesActivos === 1 ? "reporte activo" : "reportes activos"}`;
  return ultimoReporte ? `${cantidad} · ${haceCuanto(ultimoReporte)}` : cantidad;
}

// Card del paradero más cercano (F1_04): distancia, reportes, ocupación y
// las próximas unidades que llegan.
export function CardParadero({ datos, onPress }: CardParaderoProps) {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  if (!datos) {
    return (
      <View style={[styles.base, styles.cargando]} accessibilityLabel="Buscando paradero cercano">
        <ActivityIndicator color={colors.ink} />
        <Text style={[typography.body, styles.muted]}>Buscando paradero cercano…</Text>
      </View>
    );
  }

  const { paradero, distanciaM, actividad, proximas } = datos;
  const visibles = proximas.slice(0, PROXIMAS_VISIBLES);

  return (
    <Pressable
      onPress={() => onPress(paradero.id)}
      accessibilityRole="button"
      accessibilityLabel={`Ver paradero ${paradero.nombre.replace(/^Paradero /, "")}`}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      <View style={styles.fila}>
        <View style={styles.texto}>
          <Text style={[typography.overline, styles.muted]} numberOfLines={1}>
            Cerca de ti · {formatearDistancia(distanciaM)}
          </Text>
          <Text style={[typography.title, styles.ink]} numberOfLines={1}>
            {paradero.nombre}
          </Text>
          <Text style={[typography.caption, styles.muted]} numberOfLines={1}>
            {textoReportes(actividad)}
          </Text>
        </View>
        {actividad.ocupacion && <Chip label={etiquetaOcupacion(actividad.ocupacion)} state="live" />}
      </View>

      {visibles.length > 0 && (
        <View style={styles.proximas}>
          {visibles.map((unidad) => {
            const sinDatos = unidad.fuente === "sin_datos";
            return (
              <View
                key={unidad.linea.id}
                style={styles.proxima}
                accessibilityLabel={`${unidad.linea.nombre} llega en ${formatearEta(unidad.minutos, sinDatos)}${sinDatos ? ", estimado" : ""}`}
              >
                <View style={styles.linea}>
                  {/* Punto amarillo = hay reporte de ubicación; gris = estimado */}
                  <View style={[styles.punto, sinDatos && styles.puntoEstimado]} />
                  <Text style={[typography.captionStrong, styles.ink]} numberOfLines={1}>
                    {unidad.linea.nombre}
                  </Text>
                </View>
                <Text style={[typography.bodyStrong, sinDatos ? styles.muted : styles.ink]}>
                  {formatearEta(unidad.minutos, sinDatos)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </Pressable>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    base: {
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radii.xl,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    cargando: {
      flexDirection: "row",
      alignItems: "center",
    },
    fila: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },
    proximas: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    proxima: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: sizes.statPadding,
      borderRadius: radii.lg,
      backgroundColor: colors.canvas,
    },
    linea: {
      flexShrink: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    punto: {
      width: sizes.legendDot,
      height: sizes.legendDot,
      borderRadius: radii.pill,
      backgroundColor: colors.yellowDeep,
    },
    puntoEstimado: {
      backgroundColor: colors.line,
    },
    texto: {
      flex: 1,
      gap: spacing.xxs,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
    pressed: {
      opacity: opacity.pressed,
    },
  });
