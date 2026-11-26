import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { PASOS_ELIMINACION } from "@/config/cuenta";
import { useEstilos, useTema } from "@/context/TemaContext";
import { spacing, type Tema } from "@/theme";

import { IconButton } from "./IconButton";

type PantallaCuentaProps = {
  titulo: string;
  // Paso del flujo de eliminación (D2–D4): «Paso 1 de 3» + pregunta en H2
  paso?: number;
  pregunta?: string;
  children: ReactNode;
  // Botones al pie (se desplazan con el contenido si el texto es grande)
  acciones?: ReactNode;
};

// Estructura común de Mi cuenta y del flujo de eliminación (D1–D4): atrás +
// título H1, contenido con separación de 14 y acciones al pie.
export function PantallaCuenta({ titulo, paso, pregunta, children, acciones }: PantallaCuentaProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <View style={[styles.barra, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton icon={<ArrowLeft />} accessibilityLabel="Volver" onPress={() => router.back()} />
        <Text style={[typography.h1, styles.ink, styles.flex]} accessibilityRole="header" numberOfLines={2}>
          {titulo}
        </Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.contenido}>
            {paso !== undefined && (
              <Text style={[typography.overline, styles.muted]}>
                Paso {paso} de {PASOS_ELIMINACION}
              </Text>
            )}
            {pregunta && (
              <Text style={[typography.h2, styles.ink]} accessibilityRole="header">
                {pregunta}
              </Text>
            )}
            {children}
          </View>
          {acciones && <View style={styles.acciones}>{acciones}</View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    barra: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "space-between",
      gap: spacing.xl,
    },
    contenido: {
      gap: spacing.md + spacing.xxs,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    acciones: {
      gap: spacing.sm + spacing.xxs,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
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
