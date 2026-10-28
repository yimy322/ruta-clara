import { StyleSheet, Text, View } from "react-native";

import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";

type TarjetaEstadisticaProps = {
  valor: string;
  label: string;
};

// Tarjeta con una cifra grande y su descripción debajo, centradas (F2_09).
// Se reparte el ancho con sus vecinas.
export function TarjetaEstadistica({ valor, label }: TarjetaEstadisticaProps) {
  return (
    <View style={styles.base} accessible accessibilityLabel={`${valor} ${label}`}>
      <Text style={[typography.h2, styles.ink]} numberOfLines={1}>
        {valor}
      </Text>
      <Text style={[typography.caption, styles.muted]} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xxs,
    padding: sizes.statPadding,
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
});
