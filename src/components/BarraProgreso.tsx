import { StyleSheet, View } from "react-native";

import { useEstilos } from "@/context/TemaContext";
import { radii, sizes, type Tema } from "@/theme";

type BarraProgresoProps = {
  // 0–1
  progreso: number;
};

// Barra de avance de un flujo por pasos (F2_02–F2_04).
export function BarraProgreso({ progreso }: BarraProgresoProps) {
  const styles = useEstilos(crearEstilos);

  const porcentaje = Math.min(Math.max(progreso, 0), 1) * 100;

  return (
    <View
      style={styles.barra}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(porcentaje) }}
    >
      <View style={[styles.relleno, { width: `${porcentaje}%` }]} />
    </View>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    barra: {
      height: sizes.progressHeight,
      borderRadius: radii.pill,
      backgroundColor: colors.line,
      overflow: "hidden",
    },
    relleno: {
      height: "100%",
      borderRadius: radii.pill,
      backgroundColor: colors.ink,
    },
  });
