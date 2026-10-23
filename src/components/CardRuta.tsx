import { Pressable, StyleSheet, Text, View } from "react-native";

import { borderWidths, colors, opacity, radii, sizes, spacing, typography } from "@/theme";
import type { NivelTrafico, OpcionRuta } from "@/types";
import {
  etiquetaOcupacion,
  etiquetaTipo,
  etiquetaTrafico,
  formatearEta,
  formatearPasaje,
  textoReportes,
} from "@/utils/formato";

import { Chip, type ChipState } from "./Chip";

type CardRutaProps = {
  opcion: OpcionRuta;
  // Borde grueso: la opción recomendada
  recomendada?: boolean;
  onPress: () => void;
};

const CHIP_TRAFICO: Record<NivelTrafico, ChipState> = {
  bajo: "default",
  medio: "live",
  alto: "alert",
};

// Card de una opción de ruta (F1_06): línea, ETA, pasaje, tráfico, ocupación
// y reportes. Si no hay reportes, el ETA es estimado y va en gris.
export function CardRuta({ opcion, recomendada = false, onPress }: CardRutaProps) {
  const { linea, etaMin, trafico, ocupacion, reportesActivos, ultimoReporteMin, estimado } = opcion;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.base, recomendada && styles.recomendada, pressed && styles.pressed]}
    >
      <View style={styles.cabecera}>
        <Text style={[typography.bodyStrong, styles.ink, styles.nombre]} numberOfLines={1}>
          {linea.nombre} · {etiquetaTipo(linea.tipo)}
        </Text>
        <Text style={[typography.title, estimado ? styles.muted : styles.ink]}>{formatearEta(etaMin, estimado)}</Text>
      </View>
      <View style={styles.chips}>
        <Chip label={formatearPasaje(linea.pasaje)} />
        <Chip label={etiquetaTrafico(trafico)} state={CHIP_TRAFICO[trafico]} />
        {ocupacion && <Chip label={etiquetaOcupacion(ocupacion)} />}
      </View>
      <Text style={[typography.caption, styles.muted]} numberOfLines={1}>
        {estimado ? "○ Sin reportes recientes · estimado" : `● ${textoReportes(reportesActivos, ultimoReporteMin)}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    gap: spacing.sm,
    padding: sizes.cardPadding,
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  recomendada: {
    borderWidth: borderWidths.thick,
  },
  cabecera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  nombre: {
    flexShrink: 1,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
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
