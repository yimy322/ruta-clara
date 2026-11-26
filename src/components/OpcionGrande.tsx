import { Pressable, StyleSheet, Text } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { opacity, radii, sizes, spacing, type Tema } from "@/theme";

type OpcionGrandeProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

// Opción de 48 pt a todo el ancho, para elegir una entre pocas (p. ej. el
// tiempo de espera en F2_05). La elegida va en ink con texto blanco.
export function OpcionGrande({ label, selected = false, onPress }: OpcionGrandeProps) {
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.base, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[typography.bodyStrong, selected ? styles.labelSelected : styles.label]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    base: {
      // Altura mínima: con texto grande (hasta 200 %) el control crece en vez de cortar el texto
      minHeight: sizes.optionHeight,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      borderRadius: radii.control,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    selected: {
      backgroundColor: colors.ink,
    },
    label: {
      color: colors.ink,
    },
    labelSelected: {
      color: colors.surface,
    },
    pressed: {
      opacity: opacity.pressed,
    },
  });
