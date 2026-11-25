import { User } from "lucide-react-native";
import { Image, StyleSheet, View, type ImageSourcePropType } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { borderWidths, radii, type Tema } from "@/theme";

type AvatarProps = {
  // Sin foto se muestra el ícono User
  fuente?: ImageSourcePropType;
  tamano: number;
};

// Foto de perfil circular con borde punteado (F3_05, F3_07). Es decorativa:
// el nombre del usuario va siempre al lado.
export function Avatar({ fuente, tamano }: AvatarProps) {
  const { colors } = useTema();
  const styles = useEstilos(crearEstilos);

  const forma = { width: tamano, height: tamano, borderRadius: tamano / 2 };

  return (
    <View style={[styles.base, forma]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {fuente ? (
        <Image source={fuente} style={forma} resizeMode="cover" />
      ) : (
        <User color={colors.inkMuted} size={tamano / 2} />
      )}
    </View>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    base: {
      borderWidth: borderWidths.thin,
      borderStyle: "dashed",
      borderColor: colors.line,
      borderRadius: radii.pill,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
  });
