import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, minTouch, opacity, radii, shadows, sizes, typography } from "@/theme";

type Opcion<T extends string> = {
  valor: T;
  label: string;
};

type SegmentedProps<T extends string> = {
  opciones: Opcion<T>[];
  valor: T;
  onChange: (valor: T) => void;
};

// Extiende el área táctil de cada opción (40 pt) hasta 44 pt
const verticalSlop = (minTouch - sizes.segmentedHeight) / 2;
const hitSlop = { top: verticalSlop, bottom: verticalSlop };

// Control segmentado de ancho completo (p. ej. Ida / Vuelta en F1_07).
// Tarjeta con sombra; la opción elegida va en ink.
export function Segmented<T extends string>({ opciones, valor, onChange }: SegmentedProps<T>) {
  return (
    <View style={styles.base} accessibilityRole="tablist">
      {opciones.map((opcion, i) => {
        const elegida = opcion.valor === valor;
        return (
          <Pressable
            key={opcion.valor}
            onPress={() => onChange(opcion.valor)}
            hitSlop={hitSlop}
            accessibilityRole="tab"
            accessibilityState={{ selected: elegida }}
            style={({ pressed }) => [
              styles.opcion,
              i === 0 && styles.primera,
              i === opciones.length - 1 && styles.ultima,
              elegida && styles.elegida,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[typography.bodyStrong, elegida ? styles.labelElegida : styles.label]} numberOfLines={1}>
              {opcion.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    borderRadius: radii.control,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  // El recorte va en cada extremo: overflow hidden en la tarjeta cortaría la sombra
  primera: {
    borderTopLeftRadius: radii.control,
    borderBottomLeftRadius: radii.control,
  },
  ultima: {
    borderTopRightRadius: radii.control,
    borderBottomRightRadius: radii.control,
  },
  opcion: {
    flex: 1,
    height: sizes.segmentedHeight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  elegida: {
    backgroundColor: colors.ink,
  },
  label: {
    color: colors.ink,
  },
  labelElegida: {
    color: colors.surface,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
