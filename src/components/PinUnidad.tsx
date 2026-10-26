import { Play } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { borderWidths, colors, radii, sizes } from "@/theme";

import { Chip } from "./Chip";

type PinUnidadProps = {
  // Código de la línea, p. ej. "La 50"
  etiqueta: string;
};

// Cuánto entra el palito en el halo (Figma F2_04)
const SOLAPE = 10;

// Pin de la unidad que se reporta (F2_04): chip en vivo, palito y halo de
// precisión GPS. La punta del palito marca la posición.
export function PinUnidad({ etiqueta }: PinUnidadProps) {
  return (
    <View style={styles.base} accessibilityLabel={`Unidad ${etiqueta}`}>
      <Chip label={etiqueta} icon={<Play />} state="live" />
      <View style={styles.palito} />
      <View style={styles.halo} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
  },
  palito: {
    zIndex: 1,
    width: sizes.pinStemWidth,
    height: sizes.pinStem,
    backgroundColor: colors.ink,
  },
  halo: {
    width: sizes.pinHalo,
    height: sizes.pinHalo,
    marginTop: -SOLAPE,
    borderRadius: radii.pill,
    borderWidth: borderWidths.regular,
    borderStyle: "dashed",
    borderColor: colors.blue,
    backgroundColor: colors.blueHalo,
  },
});
