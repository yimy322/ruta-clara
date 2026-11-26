import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Accessibility, ArrowLeft } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useEstilos, useTema } from "@/context/TemaContext";
import { Avatar, Button, FilaAjuste, IconButton, Segmented, useToast } from "@/components";
import { usePreferencias } from "@/context/PreferenciasContext";
import type { Ajustes as PreferenciasAjustes } from "@/data/preferencias";
import { getUsuario } from "@/data/repositorio";
import { borderWidths, opacity, sizes, spacing, type Tema } from "@/theme";
import type { Usuario } from "@/types";
import { abrirWhatsApp } from "@/utils/soporte";

// Tema de la app: "Sistema" sigue el modo claro u oscuro del celular
const TEMAS: { valor: PreferenciasAjustes["tema"]; label: string }[] = [
  { valor: "sistema", label: "Sistema" },
  { valor: "claro", label: "Claro" },
  { valor: "oscuro", label: "Oscuro" },
];

// «1.0.0» → «1.0», como en Figma
const VERSION = (Constants.expoConfig?.version ?? "1.0").split(".").slice(0, 2).join(".");

// F3_05 · Ajustes: notificaciones, uso en la calle, accesibilidad y soporte.
// Los interruptores se guardan en el dispositivo (PreferenciasContext).
export default function Ajustes() {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mostrar } = useToast();
  const { ajustes, cambiarAjuste } = usePreferencias();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [error, setError] = useState(false);

  const pedirUsuario = useCallback(() => {
    getUsuario()
      .then(setUsuario)
      .catch(() => setError(true));
  }, []);

  useEffect(pedirUsuario, [pedirUsuario]);

  const reintentar = () => {
    setError(false);
    pedirUsuario();
  };

  const contactar = async () => {
    if (!(await abrirWhatsApp())) {
      mostrar("No se pudo abrir WhatsApp. Inténtalo de nuevo.");
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <View style={[styles.barra, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton icon={<ArrowLeft />} accessibilityLabel="Volver" onPress={() => router.back()} />
        <Text style={[typography.h1, styles.ink]} accessibilityRole="header">
          Ajustes
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        {usuario ? (
          <Pressable
            // TODO 4.9: abrir /cuenta (Mi cuenta, D1)
            onPress={() => mostrar("Editar perfil estará disponible pronto")}
            accessibilityRole="button"
            accessibilityLabel={`${usuario.nombre}, editar perfil`}
            style={({ pressed }) => [styles.perfil, pressed && styles.pressed]}
          >
            <Avatar fuente={usuario.avatar} tamano={sizes.avatarSmall} />
            <View style={styles.perfilTexto}>
              <Text style={[typography.bodyStrong, styles.ink]} numberOfLines={1}>
                {usuario.nombre}
              </Text>
              <Text style={[typography.caption, styles.muted]} numberOfLines={1}>
                Editar perfil · {usuario.telefono}
              </Text>
            </View>
            <Text style={[typography.bodyStrong, styles.ink]}>›</Text>
          </Pressable>
        ) : (
          <View style={styles.perfil}>
            {error ? (
              <>
                <Text style={[typography.caption, styles.muted, styles.perfilTexto]}>
                  No pudimos cargar tu perfil. Revisa tu conexión.
                </Text>
                <Button label="Reintentar" variant="tertiary" onPress={reintentar} />
              </>
            ) : (
              <ActivityIndicator color={colors.ink} />
            )}
          </View>
        )}

        <Seccion titulo="Notificaciones" />
        <FilaAjuste
          titulo="Alertas de mis rutas"
          valor={ajustes.alertasRutas}
          onValueChange={(v) => cambiarAjuste("alertasRutas", v)}
        />
        <FilaAjuste
          titulo="Seguridad cerca de mí"
          valor={ajustes.seguridadCerca}
          onValueChange={(v) => cambiarAjuste("seguridadCerca", v)}
        />
        <FilaAjuste
          titulo="Logros y puntos"
          valor={ajustes.logrosPuntos}
          onValueChange={(v) => cambiarAjuste("logrosPuntos", v)}
        />

        {/* supuesto: F3_05 no dibuja la apariencia; la decisión 42 pide Sistema / Claro / Oscuro */}
        <Seccion titulo="Apariencia" />
        <View style={styles.apariencia}>
          <Segmented
            opciones={TEMAS}
            valor={ajustes.tema}
            onChange={(tema) => cambiarAjuste("tema", tema)}
          />
        </View>

        <Seccion titulo="Uso en la calle" />
        <FilaAjuste
          titulo="Ahorro de datos"
          subtitulo="Mapa simplificado para zonas con poca señal"
          valor={ajustes.ahorroDatos}
          onValueChange={(v) => cambiarAjuste("ahorroDatos", v)}
        />
        <FilaAjuste
          titulo="Accesibilidad"
          subtitulo="Texto, contraste, movimiento y color"
          icono={<Accessibility color={colors.ink} size={sizes.settingsIcon} />}
          onPress={() => router.push("/accesibilidad")}
        />

        <Seccion titulo="Soporte" />
        <FilaAjuste
          titulo="Ayuda y preguntas frecuentes"
          simple
          // TODO: pantalla de ayuda (sin frame en Figma)
          onPress={() => mostrar("Ayuda estará disponible pronto")}
        />
        <FilaAjuste titulo="Contáctanos (WhatsApp)" simple onPress={contactar} />

        <View style={styles.espacio} />
        <Text style={[typography.caption, styles.muted, styles.pie]}>RutaClara v{VERSION} · Términos y privacidad</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Seccion({ titulo }: { titulo: string }) {
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);

  return (
    <Text style={[typography.overline, styles.muted, styles.seccion]} accessibilityRole="header">
      {titulo}
    </Text>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    barra: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xs,
    },
    contenido: {
      flexGrow: 1,
    },
    perfil: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      minHeight: sizes.menuRowHeight,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderBottomWidth: borderWidths.thin,
      borderBottomColor: colors.line,
    },
    perfilTexto: {
      flex: 1,
      gap: spacing.xxs,
    },
    apariencia: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    seccion: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
    },
    espacio: {
      flex: 1,
      minHeight: spacing.xl,
    },
    pie: {
      textAlign: "center",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
    pressed: {
      opacity: opacity.pressed,
    },
  });
