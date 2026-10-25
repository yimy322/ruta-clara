import { StyleSheet, Text, View } from "react-native";

import { colors, sizes, spacing, typography } from "@/theme";

type GraficoAfluenciaProps = {
  // Valores 0–100 de 6am a 10pm, cada 2 h (Linea.afluencia)
  valores: number[];
};

// Desde este valor la barra cuenta como hora punta
const HORA_PUNTA = 80;
const EJE = ["6am", "12m", "6pm", "10pm"];

// Barras de afluencia por hora (F1_07). Las horas punta van en ink y el resto
// en line.
export function GraficoAfluencia({ valores }: GraficoAfluenciaProps) {
  return (
    <View style={styles.base}>
      <View style={styles.barras} accessibilityLabel="Gráfico de afluencia por hora">
        {valores.map((valor, i) => (
          <View
            key={i}
            style={[
              styles.barra,
              { height: (Math.min(Math.max(valor, 0), 100) / 100) * sizes.chartBarMax },
              valor >= HORA_PUNTA && styles.horaPunta,
            ]}
          />
        ))}
      </View>
      <View style={styles.eje}>
        {EJE.map((hora) => (
          <Text key={hora} style={[typography.caption, styles.muted]}>
            {hora}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    gap: spacing.md,
  },
  barras: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
    height: sizes.chartHeight,
  },
  barra: {
    flex: 1,
    backgroundColor: colors.line,
  },
  horaPunta: {
    backgroundColor: colors.ink,
  },
  eje: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  muted: {
    color: colors.inkMuted,
  },
});
