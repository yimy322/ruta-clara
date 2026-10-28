import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BotonMantener, Button, Header, OpcionRadio, Toggle } from "@/components";
import { useReporte } from "@/context/ReporteContext";
import { useEnviarReporte } from "@/hooks/useEnviarReporte";
import { colors, spacing, typography } from "@/theme";
import type { TipoSeguridad } from "@/types";
import { etiquetaSeguridad } from "@/utils/formato";

const OPCIONES: TipoSeguridad[] = ["paradero_peligroso", "robo", "acoso", "conductor_imprudente"];

// F2_07 · Reporte de seguridad
export default function ReporteSeguridad() {
  const { borrador, actualizar } = useReporte();
  const { enviar, enviando } = useEnviarReporte();

  // Activada por defecto
  const anonimo = borrador.anonimo ?? true;

  // La alerta urgente no exige elegir qué pasó: en una emergencia no se frena
  const enviarUrgente = () => enviar({ ...borrador, anonimo, urgente: true });

  const confirmarUrgente = () =>
    Alert.alert(
      "¿Llamar al 105?",
      "Ya avisamos a los usuarios cerca. Puedes llamar a la Policía.",
      [
        { text: "Ahora no", style: "cancel", onPress: enviarUrgente },
        {
          text: "Llamar",
          onPress: () => {
            Linking.openURL("tel:105").catch(() =>
              Alert.alert("No se pudo llamar", "Marca el 105 desde tu teléfono."),
            );
            enviarUrgente();
          },
        },
      ],
      { cancelable: false },
    );

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header tono="seguridad" eyebrow="Seguridad" title="¿Qué pasó?" />

      {/* Con scroll por si no entra en pantallas chicas */}
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.opciones} accessibilityRole="radiogroup">
          {OPCIONES.map((opcion) => (
            <OpcionRadio
              key={opcion}
              label={etiquetaSeguridad(opcion)}
              selected={borrador.seguridad === opcion}
              onPress={() => actualizar({ seguridad: opcion })}
            />
          ))}
        </View>

        <View style={styles.anonima}>
          <View style={styles.anonimaTexto}>
            <Text style={[typography.bodyStrong, styles.ink]}>Alerta anónima</Text>
            <Text style={[typography.caption, styles.muted]}>No se mostrará tu perfil</Text>
          </View>
          <Toggle value={anonimo} onValueChange={(valor) => actualizar({ anonimo: valor })} accessibilityLabel="Alerta anónima" />
        </View>

        <Button
          label={enviando ? "Enviando…" : "Enviar reporte"}
          variant="secondary"
          onPress={() => enviar({ ...borrador, anonimo })}
          disabled={!borrador.seguridad || enviando}
          fullWidth
        />

        <View style={styles.espacio} />

        <BotonMantener
          label="● ALERTA URGENTE"
          accessibilityLabel="Alerta urgente"
          accessibilityHint="Mantén presionado 2 segundos para avisar a usuarios cerca"
          onCompletar={confirmarUrgente}
        />
        <Text style={[typography.caption, styles.muted, styles.centrado]}>
          Mantén presionado 2 s · avisa a usuarios cerca y ofrece llamar al 105
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  contenido: {
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  opciones: {
    gap: spacing.md,
  },
  anonima: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  anonimaTexto: {
    flex: 1,
    gap: spacing.xxs,
  },
  espacio: {
    flex: 1,
  },
  centrado: {
    textAlign: "center",
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
});
