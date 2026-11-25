import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { radii, sizes, spacing, type Tema, type Paleta } from "@/theme";

type Tamano = "compacto" | "normal" | "grande";

type EstadoPantallaProps = {
  Icono: LucideIcon;
  titulo: string;
  texto: string;
  // Fondo del círculo: yellowSoft (aviso), redSoft (error) o map (no disponible)
  tono?: "aviso" | "error" | "neutro";
  // compacto 96 (E1), normal 104, grande 112 (E3)
  tamano?: Tamano;
  // Título en H1 en vez de H2 (E3)
  tituloGrande?: boolean;
  // Botones (Button) a todo el ancho, uno debajo del otro
  acciones?: ReactNode;
  // Contenido extra entre el texto y las acciones (p. ej. la sugerencia de E1)
  children?: ReactNode;
};

const CIRCULO: Record<Tamano, { circulo: number; icono: number }> = {
  compacto: { circulo: sizes.estadoCirculoCompacto, icono: sizes.estadoIconoCompacto },
  normal: { circulo: sizes.estadoCirculo, icono: sizes.estadoIcono },
  grande: { circulo: sizes.estadoCirculoGrande, icono: sizes.estadoIconoGrande },
};

const tonos = (colors: Paleta) => ({
  aviso: { fondo: colors.yellowSoft, icono: colors.ink },
  error: { fondo: colors.redSoft, icono: colors.redStrong },
  neutro: { fondo: colors.map, icono: colors.inkMuted },
  });

// Estado vacío, de error o de aviso a pantalla completa (E1–E9): señal visual
// en un círculo, título, explicación y acciones para salir del estado.
export function EstadoPantalla({
  Icono,
  titulo,
  texto,
  tono = "aviso",
  tamano = "normal",
  tituloGrande = false,
  acciones,
  children,
}: EstadoPantallaProps) {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const { circulo, icono } = CIRCULO[tamano];
  const colores = tonos(colors)[tono];

  return (
    <View style={styles.base}>
      <View
        style={[styles.circulo, { width: circulo, height: circulo, backgroundColor: colores.fondo }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Icono color={colores.icono} size={icono} />
      </View>
      <Text style={[tituloGrande ? typography.h1 : typography.h2, styles.ink, styles.centro]} accessibilityRole="header">
        {titulo}
      </Text>
      <Text style={[typography.body, styles.muted, styles.centro]}>{texto}</Text>
      {children}
      {acciones != null && <View style={styles.acciones}>{acciones}</View>}
    </View>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    base: {
      alignItems: "center",
      gap: spacing.lg,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xl,
    },
    circulo: {
      borderRadius: radii.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    centro: {
      textAlign: "center",
    },
    acciones: {
      alignSelf: "stretch",
      gap: spacing.md,
      paddingTop: spacing.sm,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
  });
