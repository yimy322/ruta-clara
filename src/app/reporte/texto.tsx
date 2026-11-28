import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { AccessibilityInfo, ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Header } from "@/components";
import { useReporte } from "@/context/ReporteContext";
import { useEstilos, useTema } from "@/context/TemaContext";
import { ErrorIA, interpretarReporte } from "@/data/repositorio";
import { borderWidths, sizes, spacing, type Tema } from "@/theme";
import type { BorradorReporte, InterpretacionReporte } from "@/types";

const MAX_TEXTO = 280;
// La nota del reporte de tránsito tiene su propio límite (F2_06)
const MAX_NOTA_TRANSITO = 120;

// Borrador y paso del Flujo 2 que corresponde a lo que entendió la IA
function destino(texto: string, ia: InterpretacionReporte): { cambios: Partial<BorradorReporte>; paso: Href } {
  const cambios: Partial<BorradorReporte> = {
    tipo: ia.tipo,
    modo: ia.tipo === "desvio" ? "desvio" : "ubicacion",
    lineaId: ia.lineaId,
    ocupacion: ia.ocupacion,
    velocidad: ia.velocidad,
    espera: ia.espera,
    congestion: ia.congestion,
    causas: ia.causas,
    seguridad: ia.seguridad,
  };
  switch (ia.tipo) {
    case "transito":
      return { cambios: { ...cambios, nota: texto.slice(0, MAX_NOTA_TRANSITO) }, paso: "/reporte/transito" };
    case "paradero":
      return { cambios, paso: "/reporte/paradero" };
    case "seguridad":
      return { cambios, paso: "/reporte/seguridad" };
    case "desvio":
      return { cambios, paso: "/reporte/linea" };
    default:
      return { cambios, paso: ia.lineaId ? "/reporte/estado" : "/reporte/linea" };
  }
}

const MENSAJES_ERROR: Record<ErrorIA["motivo"] | "sin-red", string> = {
  limite: "Llegaste al límite de reportes con IA por hoy.",
  ocupada: "La IA está ocupada en este momento.",
  texto: "Escribe tu reporte en menos de 280 letras.",
  "sin-red": "Sin conexión. Revisa tu internet e inténtalo otra vez.",
};

// Reporte con tus palabras (7.1, supuesto: sin frame en Figma). La IA arma un
// borrador y abre el paso de siempre con las opciones marcadas; el usuario
// revisa y confirma (decisión 72).
export default function ReporteConTexto() {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const router = useRouter();
  const { reiniciar, actualizar } = useReporte();

  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const mostrarAviso = (mensaje: string) => {
    setAviso(mensaje);
    AccessibilityInfo.announceForAccessibility(mensaje);
  };

  const armar = async () => {
    const limpio = texto.trim();
    if (!limpio || enviando) {
      return;
    }
    setEnviando(true);
    setAviso(null);
    AccessibilityInfo.announceForAccessibility("Entendiendo tu reporte");
    try {
      const ia = await interpretarReporte(limpio);
      if (!ia.entendido || !ia.tipo) {
        mostrarAviso(`No entendí del todo. ${ia.falta ?? "Cuéntame qué línea es o qué está pasando."}`);
        return;
      }
      const { cambios, paso } = destino(limpio, ia);
      reiniciar();
      // Sin campos vacíos: los pasos muestran solo lo que la IA entendió
      actualizar(Object.fromEntries(Object.entries(cambios).filter(([, valor]) => valor !== undefined)));
      router.push(paso);
    } catch (error) {
      mostrarAviso(MENSAJES_ERROR[error instanceof ErrorIA ? error.motivo : "sin-red"]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header eyebrow="Reporte con IA" title="Cuéntalo con tus palabras" />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={[typography.body, styles.muted]}>
          Escribe o dicta qué pasa y armamos el reporte por ti. Tú lo revisas antes de enviarlo.
        </Text>

        <View style={styles.campo}>
          <TextInput
            value={texto}
            onChangeText={(valor) => {
              setTexto(valor);
              setAviso(null);
            }}
            multiline
            autoFocus
            maxLength={MAX_TEXTO}
            editable={!enviando}
            placeholder="Ej.: La 50 viene llena por Javier Prado"
            placeholderTextColor={colors.inkMuted}
            accessibilityLabel="Tu reporte"
            accessibilityHint="Puedes usar el micrófono del teclado para dictar"
            style={[typography.body, styles.ink, styles.campoTexto]}
          />
          <Text style={[typography.caption, styles.muted, styles.contador]}>
            {texto.length}/{MAX_TEXTO}
          </Text>
        </View>

        <View style={styles.pistas}>
          <Text style={[typography.caption, styles.muted]}>Usa el micrófono del teclado para dictar.</Text>
          <Text style={[typography.caption, styles.muted]}>No escribas datos personales.</Text>
        </View>

        {enviando && (
          <View style={styles.cargando} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.ink} />
            <Text style={[typography.body, styles.ink]}>Entendiendo tu reporte…</Text>
          </View>
        )}

        {aviso && (
          <View style={styles.aviso} accessibilityLiveRegion="polite">
            <Text style={[typography.body, styles.ink]}>{aviso}</Text>
            <Button label="Reportar paso a paso" variant="secondary" onPress={() => router.back()} fullWidth />
          </View>
        )}
      </ScrollView>

      <View style={styles.pie}>
        <Button label="Armar reporte" onPress={armar} disabled={!texto.trim() || enviando} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    contenido: {
      gap: spacing.md,
      padding: spacing.lg,
    },
    campo: {
      minHeight: sizes.noteHeight,
      padding: spacing.md,
      borderRadius: sizes.optionRadius,
      borderWidth: borderWidths.regular,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    campoTexto: {
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
    pie: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
  });
