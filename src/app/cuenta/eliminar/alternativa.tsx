import { useRouter } from "expo-router";
import { CirclePause, Trash } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { Button, PantallaCuenta, TarjetaCuenta, useToast } from "@/components";
import { DIAS_GRACIA_ELIMINACION } from "@/config/cuenta";
import { usePreferencias } from "@/context/PreferenciasContext";
import { useEstilos, useTema } from "@/context/TemaContext";
import { desactivarCuenta } from "@/data/repositorio";
import { sizes, spacing, type Tema } from "@/theme";

// D3 · Eliminar cuenta, paso 2 de 3: desactivar temporalmente como
// alternativa a eliminar definitivamente.
export default function EliminarAlternativa() {
  const router = useRouter();
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const { mostrar } = useToast();
  const { reiniciarOnboarding } = usePreferencias();

  const [desactivando, setDesactivando] = useState(false);

  const desactivar = async () => {
    setDesactivando(true);
    try {
      await desactivarCuenta();
      // Desactivar cierra la sesión, como «Cerrar sesión» (vuelve a la bienvenida)
      await reiniciarOnboarding();
    } catch {
      setDesactivando(false);
      mostrar("No se pudo desactivar tu cuenta. Revisa tu conexión.");
    }
  };

  // supuesto: Figma no dibuja la confirmación de desactivar
  const confirmarDesactivar = () => {
    Alert.alert("¿Desactivar tu cuenta?", "Ocultaremos tu perfil, pausaremos tus alertas y cerraremos tu sesión.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Desactivar", style: "destructive", onPress: () => void desactivar() },
    ]);
  };

  return (
    <PantallaCuenta
      titulo="Eliminar cuenta"
      paso={2}
      pregunta="¿Prefieres tomarte un descanso?"
      acciones={<Button label="Volver" variant="tertiary" fullWidth onPress={() => router.back()} />}
    >
      <TarjetaCuenta>
        <View style={styles.titulo}>
          <CirclePause color={colors.ink} size={sizes.settingsIcon} />
          <Text style={[typography.title, styles.ink, styles.flex]} accessibilityRole="header">
            Desactivar temporalmente
          </Text>
        </View>
        <Text style={[typography.body, styles.muted]}>
          Ocultamos tu perfil y pausamos tus alertas. Vuelves cuando quieras iniciando sesión y conservas tus puntos.
        </Text>
        <Button
          label={desactivando ? "Desactivando…" : "Desactivar mi cuenta"}
          variant="secondary"
          fullWidth
          disabled={desactivando}
          onPress={confirmarDesactivar}
        />
      </TarjetaCuenta>

      <TarjetaCuenta>
        <View style={styles.titulo}>
          <Trash color={colors.redStrong} size={sizes.settingsIcon} />
          <Text style={[typography.title, styles.ink, styles.flex]} accessibilityRole="header">
            Eliminar definitivamente
          </Text>
        </View>
        <Text style={[typography.body, styles.muted]}>
          Después de {DIAS_GRACIA_ELIMINACION} días se borran tu perfil, tus puntos y tu historial. No se puede deshacer.
        </Text>
        <Button
          label="Seguir con la eliminación"
          variant="danger"
          fullWidth
          disabled={desactivando}
          onPress={() => router.push("/cuenta/eliminar/confirmar")}
        />
      </TarjetaCuenta>
    </PantallaCuenta>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    titulo: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm + spacing.xxs,
    },
    flex: {
      flex: 1,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
  });
