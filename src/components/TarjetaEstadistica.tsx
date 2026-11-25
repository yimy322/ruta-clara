import { StyleSheet, Text, View } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { radii, sizes, spacing, type Tema } from "@/theme";

type TarjetaEstadisticaProps = {
  valor: string;
  label: string;
};

// Tarjeta con una cifra grande y su descripción debajo, centradas (F2_09).
// Se reparte el ancho con sus vecinas.
export function TarjetaEstadistica({ valor, label }: TarjetaEstadisticaProps) {
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);

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

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    base: {
      flex: 1,
      alignItems: "center",
      gap: spacing.xxs,
      padding: sizes.statPadding,
      borderRadius: radii.lg,
      backgroundColor: colors.canvas,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
  });
