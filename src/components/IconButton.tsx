import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { borderWidths, opacity, radii, sizes, type Tema } from "@/theme";
import { withIconDefaults } from "@/utils/icons";

type IconButtonProps = {
  icon: ReactNode;
  onPress: () => void;
  active?: boolean;
  // Fondo amarillo: algo que el usuario marcó, como un favorito (F1_07, F3_02).
  // No confundir con Live, que es el amarillo de las unidades en vivo
  // "seguridad": borde rojo, como el acceso al mapa de seguridad (F3_07)
  tono?: "destacado" | "seguridad";
  accessibilityLabel: string;
};

// Botón de ícono circular de 44 pt (Figma 73:1005) con sombra de tarjeta.
// Pensado para íconos de lucide-react-native: si el ícono no define color ni
// tamaño, se le asignan según el estado.
export function IconButton({ icon, onPress, active = false, tono, accessibilityLabel }: IconButtonProps) {
  const { colors } = useTema();
  const styles = useEstilos(crearEstilos);

  const destacado = tono === "destacado";
  const color = active ? colors.surface : destacado ? colors.onYellow : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active || destacado }}
      style={({ pressed }) => [
        styles.base,
        active && styles.active,
        destacado && styles.destacado,
        tono === "seguridad" && styles.seguridad,
        pressed && styles.pressed,
      ]}
    >
      {withIconDefaults(icon, { color, size: sizes.iconGlyph })}
    </Pressable>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    base: {
      width: sizes.iconButton,
      height: sizes.iconButton,
      borderRadius: radii.pill,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      ...shadows.card,
    },
    active: {
      backgroundColor: colors.ink,
    },
    destacado: {
      backgroundColor: colors.yellow,
    },
    seguridad: {
      borderWidth: borderWidths.regular,
      borderColor: colors.red,
    },
    pressed: {
      opacity: opacity.pressed,
    },
  });
