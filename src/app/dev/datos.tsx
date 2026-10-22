import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Chip, Header, ListItem } from "@/components";
import { buscarRutas } from "@/data/repositorio";
import { colors, radii, spacing, typography } from "@/theme";
import type { OpcionRuta, TipoUnidad } from "@/types";
import { formatearEta, formatearPasaje } from "@/utils/formato";

// Pantalla de desarrollo: verifica que el repositorio devuelva datos.
// Se abre desde "Ver datos" en Inicio.
const ORIGEN = "Mi ubicación";
const DESTINO = "Jockey Plaza";

const nombreTipo: Record<TipoUnidad, string> = {
  combi: "Combi",
  custer: "Custer",
  micro: "Micro",
};

export default function Datos() {
  const [opciones, setOpciones] = useState<OpcionRuta[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelado = false;
    buscarRutas(ORIGEN, DESTINO)
      .then((resultado) => {
        if (!cancelado) setOpciones(resultado);
      })
      .catch(() => {
        if (!cancelado) setError(true);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header title="Datos de prueba" subtitle={`buscarRutas("${ORIGEN}", "${DESTINO}")`} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {error ? (
          <Text style={styles.muted}>No se pudieron cargar las rutas.</Text>
        ) : opciones == null ? (
          <ActivityIndicator color={colors.ink} accessibilityLabel="Cargando rutas" />
        ) : (
          <View style={styles.card}>
            {opciones.map((opcion) => (
              <View key={opcion.linea.id}>
                <ListItem
                  badge={opcion.linea.codigo}
                  title={`${opcion.linea.nombre} · ${nombreTipo[opcion.linea.tipo]}`}
                  subtitle={describir(opcion)}
                  trailing={formatearEta(opcion.etaMin, opcion.estimado)}
                />
                <View style={styles.chips}>
                  {opcion.estimado ? <Chip label="Estimado" /> : <Chip label="En vivo" state="live" />}
                  <Chip label={`Tráfico ${opcion.trafico}`} />
                  {opcion.ocupacion != null && <Chip label={opcion.ocupacion} />}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function describir(opcion: OpcionRuta) {
  const pasaje = formatearPasaje(opcion.linea.pasaje);
  if (opcion.estimado) {
    return `${pasaje} · Sin reportes recientes · estimado`;
  }
  const ultimo = opcion.ultimoReporteMin != null ? ` · último hace ${opcion.ultimoReporteMin} min` : "";
  return `${pasaje} · ${opcion.reportesActivos} reportes activos${ultimo}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  muted: {
    ...typography.body,
    color: colors.inkMuted,
  },
});
