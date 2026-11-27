import { Check, X } from "lucide-react-native";
import { useState, type Ref } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type TextStyle,
} from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { borderWidths, radii, sizes, type Tema } from "@/theme";

type CampoCuentaProps = Omit<TextInputProps, "style"> & {
  etiqueta: string;
  // Mensaje bajo el campo con ícono + texto (no solo color): ok = ✓, si no ✗ rojo
  validacion?: { ok: boolean; texto: string } | null;
  estiloEntrada?: StyleProp<TextStyle>;
  ref?: Ref<TextInputInstance>;
};

// Campo de texto de D4 (Eliminar cuenta) y del inicio de sesión: etiqueta
// CaptionStrong, borde ink de 1,5, anillo de foco y validación accesible.
export function CampoCuenta({
  etiqueta,
  validacion,
  estiloEntrada,
  onFocus,
  onBlur,
  accessibilityLabel,
  ref,
  ...props
}: CampoCuentaProps) {
  const { colors, shadows, typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={styles.campo}>
      <Text style={[typography.captionStrong, styles.ink]} importantForAccessibility="no" accessibilityElementsHidden>
        {etiqueta}
      </Text>
      <TextInput
        ref={ref}
        {...props}
        accessibilityLabel={accessibilityLabel ?? etiqueta}
        placeholderTextColor={colors.inkMuted}
        onFocus={(e) => {
          setEnfocado(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setEnfocado(false);
          onBlur?.(e);
        }}
        style={[typography.bodyStrong, styles.ink, styles.entrada, enfocado && shadows.focusRing, estiloEntrada]}
      />
      {validacion && (
        <View style={styles.validacion} accessibilityLiveRegion="polite">
          {validacion.ok ? (
            <Check color={colors.ink} size={sizes.chipIcon} />
          ) : (
            <X color={colors.redStrong} size={sizes.chipIcon} />
          )}
          <Text style={[typography.caption, styles.flex, validacion.ok ? styles.ink : styles.rojo]}>
            {validacion.texto}
          </Text>
        </View>
      )}
    </View>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    campo: {
      gap: sizes.chipGap,
      paddingTop: sizes.chipGap,
    },
    entrada: {
      padding: sizes.cardPadding,
      borderWidth: borderWidths.regular,
      borderColor: colors.ink,
      borderRadius: radii.badge,
      backgroundColor: colors.surface,
    },
    validacion: {
      flexDirection: "row",
      alignItems: "center",
      gap: sizes.chipGap,
    },
    flex: {
      flex: 1,
    },
    ink: {
      color: colors.ink,
    },
    rojo: {
      color: colors.redStrong,
    },
  });
