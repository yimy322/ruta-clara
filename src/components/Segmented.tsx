import { Pressable, StyleSheet, Text, View } from "react-native";

import { borderWidths, colors, minTouch, opacity, sizes, typography } from "@/theme";

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
// La opción elegida va en ink.
export function Segmented<T extends string>({ opciones, valor, onChange }: SegmentedProps<T>) {
  return (
    <View style={styles.base} accessibilityRole="tablist">
      {opciones.map((opcion) => {
        const elegida = opcion.valor === valor;
        return (
          <Pressable
            key={opcion.valor}
            onPress={() => onChange(opcion.valor)}
            hitSlop={hitSlop}
            accessibilityRole="tab"
            accessibilityState={{ selected: elegida }}
            style={({ pressed }) => [styles.opcion, elegida && styles.elegida, pressed && styles.pressed]}
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
    borderRadius: sizes.segmentedRadius,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    overflow: "hidden",
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
