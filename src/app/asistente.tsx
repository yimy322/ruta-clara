import { useRouter } from "expo-router";
import { useState } from "react";
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, CampoIA, Header, MENSAJES_ERROR_IA } from "@/components";
import { useEstilos, useTema } from "@/context/TemaContext";
import { ErrorIA, getDestino, interpretarViaje } from "@/data/repositorio";
import { spacing, type Tema } from "@/theme";

const ORIGEN = "Mi ubicación";

// Asistente de viaje (7.2, supuesto: sin frame en Figma). La IA propone buscar
// rutas o crear una alerta diaria y abre F1_06 o F3_03 con los datos llenos;
// el usuario confirma ahí (decisión 72).
export default function Asistente() {
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const router = useRouter();

  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const mostrarAviso = (mensaje: string) => {
    setAviso(mensaje);
    AccessibilityInfo.announceForAccessibility(mensaje);
  };

  const preparar = async () => {
    const limpio = texto.trim();
    if (!limpio || enviando) {
      return;
    }
    setEnviando(true);
    setAviso(null);
    AccessibilityInfo.announceForAccessibility("Preparando tu viaje");
    try {
      const ia = await interpretarViaje(limpio);
      const nombre = ia.destinoNombre ?? ia.lugar;
      if (!ia.entendido || !ia.accion || !nombre) {
        mostrarAviso(`No entendí del todo. ${ia.falta ?? "Dime a dónde quieres ir."}`);
        return;
      }

      if (ia.accion === "buscar_rutas") {
        router.push({ pathname: "/rutas", params: { origen: ORIGEN, destino: nombre } });
        return;
      }

      // Alerta: un lugar guardado (Casa, Trabajo, U) se resuelve al destino más cercano
      const destinoId = ia.destinoId ?? (await getDestino(nombre))?.id;
      const params: Record<string, string> = {};
      if (destinoId) params.destinoId = destinoId;
      if (ia.hora !== undefined) params.hora = String(ia.hora);
      if (ia.minuto !== undefined) params.minuto = String(ia.minuto);
      if (ia.dias) params.dias = ia.dias.join(",");
      if (ia.minutosAntes !== undefined) params.minutosAntes = String(ia.minutosAntes);
      router.push({ pathname: "/alerta", params });
    } catch (error) {
      mostrarAviso(MENSAJES_ERROR_IA[error instanceof ErrorIA ? error.motivo : "sin-red"]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header eyebrow="Asistente con IA" title="¿A dónde quieres ir?" />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={[typography.body, styles.muted]}>
          Cuéntame a dónde vas o cuándo quieres que te avise. Te muestro las rutas o preparo la alerta para que la
          revises.
        </Text>

        <CampoIA
          valor={texto}
          onCambiar={(valor) => {
            setTexto(valor);
            setAviso(null);
          }}
          placeholder="Ej.: Quiero ir al Jockey Plaza · Avísame para ir al trabajo a las 7:30"
          accessibilityLabel="Tu viaje"
          enviando={enviando}
          textoEnviando="Preparando tu viaje…"
          aviso={aviso}
          etiquetaAlternativa="Buscar a mano"
          onAlternativa={() => router.back()}
        />
      </ScrollView>

      <View style={styles.pie}>
        <Button label="Preparar" onPress={preparar} disabled={!texto.trim() || enviando} fullWidth />
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
    muted: {
      color: colors.inkMuted,
    },
  });
