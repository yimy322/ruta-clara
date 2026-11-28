import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import type { MotivoErrorIA } from "@/data/repositorio";
import { borderWidths, sizes, spacing, type Tema } from "@/theme";

import { Button } from "./Button";

// Largo máximo que acepta la Edge Function interpretar-reporte
export const MAX_TEXTO_IA = 280;

// Por qué la IA no pudo (ErrorIA["motivo"] o sin red), para el aviso del campo
export const MENSAJES_ERROR_IA: Record<MotivoErrorIA | "sin-red", string> = {
  limite: "Llegaste al límite de usos de la IA por hoy.",
  ocupada: "La IA está ocupada en este momento.",
  texto: "Escribe en menos de 280 letras.",
  "sin-red": "Sin conexión. Revisa tu internet e inténtalo otra vez.",
};

type CampoIAProps = {
  valor: string;
  onCambiar: (valor: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  enviando: boolean;
  // p. ej. "Entendiendo tu reporte…"
  textoEnviando: string;
  // Mensaje cuando la IA no pudo (no entendió, límite, ocupada, sin red)
  aviso: string | null;
  // Camino sin IA: «Reportar paso a paso», «Buscar a mano»
  etiquetaAlternativa: string;
  onAlternativa: () => void;
};

// Campo de texto o dictado para la IA (7.1 y 7.2; supuesto, sin frame en
// Figma): contador, pistas de dictado y privacidad, estado de carga y aviso
// con el camino sin IA
export function CampoIA({
  valor,
  onCambiar,
  placeholder,
  accessibilityLabel,
  enviando,
  textoEnviando,
  aviso,
  etiquetaAlternativa,
  onAlternativa,
}: CampoIAProps) {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  return (
    <View style={styles.base}>
      <View style={styles.campo}>
        <TextInput
          value={valor}
          onChangeText={onCambiar}
          multiline
          autoFocus
          maxLength={MAX_TEXTO_IA}
          editable={!enviando}
          placeholder={placeholder}
          placeholderTextColor={colors.inkMuted}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint="Puedes usar el micrófono del teclado para dictar"
          style={[typography.body, styles.ink, styles.texto]}
        />
        <Text style={[typography.caption, styles.muted, styles.contador]}>
          {valor.length}/{MAX_TEXTO_IA}
        </Text>
      </View>

      <View style={styles.pistas}>
        <Text style={[typography.caption, styles.muted]}>Usa el micrófono del teclado para dictar.</Text>
        <Text style={[typography.caption, styles.muted]}>No escribas datos personales.</Text>
      </View>

      {enviando && (
        <View style={styles.cargando} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.ink} />
          <Text style={[typography.body, styles.ink]}>{textoEnviando}</Text>
        </View>
      )}

      {aviso && (
        <View style={styles.aviso} accessibilityLiveRegion="polite">
          <Text style={[typography.body, styles.ink]}>{aviso}</Text>
          <Button label={etiquetaAlternativa} variant="secondary" onPress={onAlternativa} fullWidth />
        </View>
      )}
    </View>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    base: {
      gap: spacing.md,
    },
    campo: {
      minHeight: sizes.noteHeight,
      padding: spacing.md,
      borderRadius: sizes.optionRadius,
      borderWidth: borderWidths.regular,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    texto: {
      flex: 1,
      padding: 0,
      textAlignVertical: "top",
    },
    contador: {
      textAlign: "right",
    },
    pistas: {
      gap: spacing.xxs,
    },
    cargando: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    aviso: {
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: sizes.optionRadius,
      borderWidth: borderWidths.regular,
      borderColor: colors.line,
      backgroundColor: colors.canvas,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
  });
