import { MapPin } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";

import { Button } from "./Button";

type BannerUbicacionProps = {
  // false cuando el usuario ya rechazó el permiso y solo queda ir a ajustes
  puedePedir: boolean;
  onPress: () => void;
};

// Aviso de Inicio cuando no hay permiso de ubicación. Mismo estilo que el
// pre-permiso de F1_03. // supuesto: no está en Figma
export function BannerUbicacion({ puedePedir, onPress }: BannerUbicacionProps) {
  return (
    <View style={styles.card}>
      <View style={styles.icono}>
        <MapPin color={colors.ink} size={sizes.iconGlyph} />
      </View>
      <Text style={styles.texto}>Activa tu ubicación para ver paraderos cerca</Text>
      {/* supuesto: textos del botón */}
      <Button label={puedePedir ? "Activar" : "Abrir ajustes"} variant="tertiary" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingLeft: sizes.cardPadding,
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  icono: {
    width: sizes.prePermisoIcon,
    height: sizes.prePermisoIcon,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
  },
  texto: {
    ...typography.caption,
    flex: 1,
    color: colors.ink,
  },
});
