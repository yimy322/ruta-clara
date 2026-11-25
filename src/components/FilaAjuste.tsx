import { ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { borderWidths, opacity, sizes, spacing, type Tema } from "@/theme";

import { Toggle } from "./Toggle";

type FilaAjusteProps = {
  titulo: string;
  subtitulo?: string;
  // Ícono de lucide-react-native a la izquierda (fila Accesibilidad)
  icono?: ReactNode;
  // Título en Body regular, para filas de enlace simples (Soporte)
  simple?: boolean;
  // Si hay valor, la fila es un interruptor; si no, un enlace con ›
  valor?: boolean;
  onValueChange?: (valor: boolean) => void;
  onPress?: () => void;
};

// Fila de Ajustes (F3_05): título, subtítulo opcional y a la derecha un
// Toggle o un chevron. Toda la fila es el área táctil.
export function FilaAjuste({ titulo, subtitulo, icono, simple = false, valor, onValueChange, onPress }: FilaAjusteProps) {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const esInterruptor = valor !== undefined;
  const alternar = () => onValueChange?.(!valor);

  return (
    <Pressable
      onPress={esInterruptor ? alternar : onPress}
      accessibilityRole={esInterruptor ? "switch" : "button"}
      accessibilityLabel={subtitulo ? `${titulo}, ${subtitulo}` : titulo}
      accessibilityState={esInterruptor ? { checked: valor } : undefined}
      style={({ pressed }) => [styles.base, !esInterruptor && pressed && styles.pressed]}
    >
      {icono}
      <View style={styles.texto}>
        <Text style={[simple ? typography.body : typography.bodyStrong, styles.ink]}>{titulo}</Text>
        {subtitulo != null && <Text style={[typography.caption, styles.muted]}>{subtitulo}</Text>}
      </View>
      {esInterruptor ? (
        // La fila ya anuncia el estado: el Toggle no se repite al lector
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Toggle value={valor} onValueChange={alternar} />
        </View>
      ) : (
        <ChevronRight color={colors.ink} size={sizes.chevron} />
      )}
    </Pressable>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    base: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      minHeight: sizes.minTouchRow,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderBottomWidth: borderWidths.thin,
      borderBottomColor: colors.line,
      backgroundColor: colors.surface,
    },
    texto: {
      flex: 1,
      gap: spacing.xxs,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
    pressed: {
      opacity: opacity.pressed,
    },
  });
