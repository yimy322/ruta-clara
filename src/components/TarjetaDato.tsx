import { StyleSheet, Text, View } from "react-native";

import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";

type TarjetaDatoProps = {
  label: string;
  valor: string;
};

// Tarjeta chica con un dato de la línea (pasaje, frecuencia, horario). Se
// reparte el ancho con sus vecinas.
export function TarjetaDato({ label, valor }: TarjetaDatoProps) {
  return (
    <View style={styles.base}>
      <Text style={[typography.overline, styles.muted]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[typography.bodyStrong, styles.ink]} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
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
