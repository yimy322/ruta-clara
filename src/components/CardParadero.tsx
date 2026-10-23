import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { borderWidths, colors, opacity, radii, sizes, spacing, typography } from "@/theme";
import type { Paradero, ResumenParadero } from "@/types";
import { etiquetaOcupacion, formatearDistancia, haceCuanto } from "@/utils/formato";

import { Chip } from "./Chip";

export type DatosCardParadero = {
  paradero: Paradero;
  distanciaM: number;
  resumen: ResumenParadero;
};

type CardParaderoProps = {
  // null mientras se cargan los datos
  datos: DatosCardParadero | null;
  onPress: () => void;
};

// "3 reportes activos · hace 4 min"
function textoReportes({ reportesActivos, ultimoReporte }: ResumenParadero) {
  if (reportesActivos === 0) {
    return "Sin reportes activos";
  }
  const cantidad = `${reportesActivos} ${reportesActivos === 1 ? "reporte activo" : "reportes activos"}`;
  return ultimoReporte ? `${cantidad} · ${haceCuanto(ultimoReporte)}` : cantidad;
}

// Card del paradero más cercano (F1_04): distancia, reportes y ocupación.
export function CardParadero({ datos, onPress }: CardParaderoProps) {
  if (!datos) {
    return (
      <View style={styles.base} accessibilityLabel="Buscando paradero cercano">
        <ActivityIndicator color={colors.ink} />
        <Text style={[typography.body, styles.muted]}>Buscando paradero cercano…</Text>
      </View>
    );
  }

  const { paradero, distanciaM, resumen } = datos;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      <View style={styles.texto}>
        <Text style={[typography.overline, styles.muted]} numberOfLines={1}>
          Cerca de ti · {formatearDistancia(distanciaM)}
        </Text>
        <Text style={[typography.title, styles.ink]} numberOfLines={1}>
          {paradero.nombre}
        </Text>
        <Text style={[typography.caption, styles.muted]} numberOfLines={1}>
          {textoReportes(resumen)}
        </Text>
      </View>
      {resumen.ocupacion && <Chip label={etiquetaOcupacion(resumen.ocupacion)} state="live" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: sizes.cardPadding,
    borderRadius: radii.lg,
    borderWidth: borderWidths.strong,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
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
