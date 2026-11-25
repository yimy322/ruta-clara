import { StyleSheet, View } from "react-native";

import { useEstilos } from "@/context/TemaContext";
import { radii, sizes, spacing, type Tema } from "@/theme";

type EsqueletoRutaProps = {
  // 0, 1 o 2: cada tarjeta es un poco más tenue y de anchos distintos (E2)
  indice: number;
};

// Anchos de las barras de cada tarjeta (Figma E2): [nombre, chips…, detalle]
const ANCHOS = [
  { nombre: 120, chips: [56, 80, 64], detalle: 200 },
  { nombre: 140, chips: [56, 80, 64], detalle: 180 },
  { nombre: 110, chips: [56, 80, 64], detalle: 160 },
];
const OPACIDAD = [1, 0.8, 0.6];
// Ancho de la barra de ETA
const ANCHO_ETA = 48;

// Tarjeta de ruta en blanco mientras se buscan rutas (E2). Es estática (sin
// brillo animado), así que respeta «reducir movimiento». Se oculta al lector.
export function EsqueletoRuta({ indice }: EsqueletoRutaProps) {
  const styles = useEstilos(crearEstilos);

  const anchos = ANCHOS[indice % ANCHOS.length];

  return (
    <View
      style={[styles.base, { opacity: OPACIDAD[indice % OPACIDAD.length] }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.fila}>
        <View style={[styles.barra, styles.texto, { width: anchos.nombre }]} />
        <View style={[styles.barra, styles.texto, { width: ANCHO_ETA }]} />
      </View>
      <View style={styles.chips}>
        {anchos.chips.map((ancho, i) => (
          <View key={i} style={[styles.barra, styles.chip, { width: ancho }]} />
        ))}
      </View>
      <View style={[styles.barra, styles.linea, { width: anchos.detalle }]} />
    </View>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    base: {
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radii.control,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    fila: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    chips: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    barra: {
      borderRadius: radii.pill,
      backgroundColor: colors.map,
    },
    texto: {
      height: sizes.esqueletoTexto,
    },
    chip: {
      height: sizes.esqueletoChip,
    },
    linea: {
      height: sizes.esqueletoLinea,
    },
  });
