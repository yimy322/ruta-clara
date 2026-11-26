import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { radii, sizes, spacing, type Tema } from "@/theme";

type TarjetaCuentaProps = {
  // Título en Title («Se elimina», «Se conserva»…)
  titulo?: string;
  children: ReactNode;
  estilo?: StyleProp<ViewStyle>;
};

// Tarjeta blanca con sombra de Mi cuenta y del flujo de eliminación (D1–D5)
export function TarjetaCuenta({ titulo, children, estilo }: TarjetaCuentaProps) {
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);

  return (
    <View style={[styles.tarjeta, estilo]}>
      {titulo && (
        <Text style={[typography.title, styles.ink]} accessibilityRole="header">
          {titulo}
        </Text>
      )}
      {children}
    </View>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    tarjeta: {
      gap: spacing.sm + spacing.xxs,
      paddingHorizontal: spacing.lg,
      paddingVertical: sizes.cardPadding,
      borderRadius: radii.control,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    ink: {
      color: colors.ink,
    },
  });
