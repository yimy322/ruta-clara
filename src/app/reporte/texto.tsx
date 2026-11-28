import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, CampoIA, Header, MENSAJES_ERROR_IA } from "@/components";
import { useReporte } from "@/context/ReporteContext";
import { useEstilos, useTema } from "@/context/TemaContext";
import { ErrorIA, interpretarReporte } from "@/data/repositorio";
import { spacing, type Tema } from "@/theme";
import type { BorradorReporte, InterpretacionReporte } from "@/types";

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


// Reporte con tus palabras (7.1, supuesto: sin frame en Figma). La IA arma un
// borrador y abre el paso de siempre con las opciones marcadas; el usuario
// revisa y confirma (decisión 72).
export default function ReporteConTexto() {
  const { typography } = useTema();
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
      mostrarAviso(MENSAJES_ERROR_IA[error instanceof ErrorIA ? error.motivo : "sin-red"]);
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

        <CampoIA
          valor={texto}
          onCambiar={(valor) => {
            setTexto(valor);
            setAviso(null);
          }}
          placeholder="Ej.: La 50 viene llena por Javier Prado"
          accessibilityLabel="Tu reporte"
          enviando={enviando}
          textoEnviando="Entendiendo tu reporte…"
          aviso={aviso}
          etiquetaAlternativa="Reportar paso a paso"
          onAlternativa={() => router.back()}
        />
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
