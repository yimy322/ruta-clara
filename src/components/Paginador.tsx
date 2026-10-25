import { StyleSheet, View } from "react-native";

import { colors, radii, sizes } from "@/theme";

type PaginadorProps = {
  total: number;
  // Índice de la página visible (desde 0)
  activo: number;
};

// Puntos de paginación (F1_02–F1_03): el activo es una barra más ancha.
export function Paginador({ total, activo }: PaginadorProps) {
  return (
    <View
      style={styles.fila}
      accessible
      accessibilityLabel={`Página ${activo + 1} de ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.punto, i === activo && styles.activo]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.dotGap,
  },
  punto: {
    width: sizes.dot,
    height: sizes.dot,
    borderRadius: radii.pill,
    backgroundColor: colors.line,
  },
  activo: {
    width: sizes.dotActive,
    backgroundColor: colors.ink,
  },
});
