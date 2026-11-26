import { useRouter } from "expo-router";
import { Clock, Mail } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, TarjetaCuenta, useToast } from "@/components";
import { usePreferencias } from "@/context/PreferenciasContext";
import { useEstilos, useTema } from "@/context/TemaContext";
import { cancelarEliminacion, getCuenta } from "@/data/repositorio";
import { radii, sizes, spacing, type Tema } from "@/theme";
import type { Cuenta } from "@/types";
import { formatearFechaLarga } from "@/utils/formato";

// undefined = cargando; null = error
type Estado = Cuenta | null | undefined;

// D5 · Eliminación programada: periodo de gracia de 30 días. Sin gesto atrás
// (_layout). «Entendido» cierra la sesión; «Cancelar eliminación» vuelve a
// Mi cuenta.
export default function EliminacionProgramada() {
  const router = useRouter();
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const { mostrar } = useToast();
  const { reiniciarOnboarding } = usePreferencias();

  const [cuenta, setCuenta] = useState<Estado>();
  const [cancelando, setCancelando] = useState(false);

  const pedirCuenta = useCallback(() => {
    getCuenta()
      .then(setCuenta)
      .catch(() => setCuenta(null));
  }, []);

  useEffect(pedirCuenta, [pedirCuenta]);

  const reintentar = () => {
    setCuenta(undefined);
    pedirCuenta();
  };

  const cancelar = async () => {
    setCancelando(true);
    try {
      await cancelarEliminacion();
      mostrar("Cancelaste la eliminación de tu cuenta");
      router.dismissTo("/cuenta");
    } catch {
      setCancelando(false);
      mostrar("No se pudo cancelar la eliminación. Revisa tu conexión.");
    }
  };

  // «Cerramos tu sesión»: igual que Cerrar sesión, vuelve a la bienvenida
  const entendido = () => void reiniciarOnboarding();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.contenido}>
          <View style={styles.senal}>
            <Clock color={colors.ink} size={sizes.estadoIcono} />
          </View>

          {cuenta === undefined && <ActivityIndicator color={colors.ink} />}

          {cuenta === null && (
            <>
              <Text style={[typography.body, styles.muted, styles.centro]}>
                No pudimos cargar la fecha de eliminación. Revisa tu conexión.
              </Text>
              <Button label="Reintentar" variant="tertiary" onPress={reintentar} />
            </>
          )}

          {cuenta?.eliminacionEl && (
            <>
              <Text style={[typography.h2, styles.ink, styles.centro]} accessibilityRole="header">
                Tu cuenta se eliminará el {formatearFechaLarga(cuenta.eliminacionEl)}
              </Text>
              <Text style={[typography.body, styles.muted, styles.centro]}>
                Cerramos tu sesión. Si cambias de opinión, inicia sesión antes de esa fecha y toca «Cancelar eliminación».
              </Text>
              <TarjetaCuenta estilo={styles.tarjeta}>
                <View style={styles.fila}>
                  <Mail color={colors.ink} size={sizes.settingsIcon} />
                  <Text style={[typography.body, styles.ink, styles.flex]}>
                    Te enviamos un comprobante a {cuenta.correo} con los pasos para cancelar la solicitud.
                  </Text>
                </View>
              </TarjetaCuenta>
            </>
          )}
        </View>

        <View style={styles.acciones}>
          <Button label="Entendido" fullWidth disabled={cancelando} onPress={entendido} />
          {cuenta?.eliminacionEl && (
            <Button
              label={cancelando ? "Cancelando…" : "Cancelar eliminación"}
              variant="secondary"
              fullWidth
              disabled={cancelando}
              onPress={cancelar}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "space-between",
      gap: spacing.xl,
    },
    contenido: {
      alignItems: "center",
      gap: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: sizes.periodoGraciaTop,
    },
    senal: {
      width: sizes.estadoCirculo,
      height: sizes.estadoCirculo,
      borderRadius: radii.pill,
      backgroundColor: colors.yellowSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    tarjeta: {
      alignSelf: "stretch",
    },
    fila: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },
    acciones: {
      gap: spacing.sm + spacing.xxs,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    centro: {
      textAlign: "center",
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
