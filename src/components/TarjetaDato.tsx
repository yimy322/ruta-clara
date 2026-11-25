import { StyleSheet, Text, View } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { radii, sizes, spacing, type Tema } from "@/theme";

type TarjetaDatoProps = {
  label: string;
  valor: string;
};

// Tarjeta chica con un dato de la línea (pasaje, frecuencia, horario). Se
// reparte el ancho con sus vecinas.
export function TarjetaDato({ label, valor }: TarjetaDatoProps) {
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);

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

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    base: {
      flex: 1,
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
