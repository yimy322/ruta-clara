import { Check, Clock, TriangleAlert, type LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { useTema } from "@/context/TemaContext";
import { radii, sizes, type Paleta } from "@/theme";

export type NivelPildora = "alto" | "medio" | "sin";

const NIVEL: Record<NivelPildora, { label: string; Icono: LucideIcon }> = {
  alto: { label: "Alto", Icono: TriangleAlert },
  medio: { label: "Medio", Icono: Clock },
  sin: { label: "Sin reportes", Icono: Check },
};

const colores = (colors: Paleta): Record<NivelPildora, { fondo: string; texto: string }> => ({
  alto: { fondo: colors.redSoft, texto: colors.redStrong },
  medio: { fondo: colors.yellowSoft, texto: colors.ink },
  sin: { fondo: colors.canvas, texto: colors.ink },
});

// Nivel de riesgo con ícono, color y texto (A2 «Ejemplo de leyenda»): el
// nivel se entiende sin depender del color.
export function PildoraNivel({ nivel }: { nivel: NivelPildora }) {
  const { colors, typography } = useTema();
  const { label, Icono } = NIVEL[nivel];
  const { fondo, texto } = colores(colors)[nivel];

  return (
    <View style={[styles.base, { backgroundColor: fondo }]}>
      <Icono color={texto} size={sizes.leyendaIcono} />
      <Text style={[typography.captionStrong, { color: texto }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.chipGap,
    paddingHorizontal: sizes.leyendaPaddingX,
    paddingVertical: sizes.leyendaPaddingY,
    borderRadius: radii.pill,
    alignSelf: "flex-start",
  },
});
