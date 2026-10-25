import { Redirect, usePreventRemove, useRouter } from "expo-router";
import { Play, TriangleAlert } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Header, Toggle, useToast } from "@/components";
import { INTERVALO_PARADERO_MS } from "@/config/simulacion";
import { idsRecorrido, useViaje } from "@/context/ViajeContext";
import { getTramoViaje } from "@/data/repositorio";
import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
import type { ParaderoTramo } from "@/types";
import { formatearEta } from "@/utils/formato";

// Paraderos intermedios que se listan antes del destino, como en Figma
const PROXIMOS_VISIBLES = 3;

// F1_09 · En tránsito (a bordo)
export default function ABordo() {
  const router = useRouter();
  const { mostrar } = useToast();
  const { viaje, avanzarParadero, finalizar, setAvisarParaBajar } = useViaje();

  const [tramo, setTramo] = useState<ParaderoTramo[]>();
  const avisado = useRef(false);

  const lineaId = viaje?.linea.id;
  const sentido = viaje?.sentido;
  const paraderoEsperaId = viaje?.paraderoEspera.id;
  const destino = viaje?.destino;

  useEffect(() => {
    if (!lineaId || !sentido || !paraderoEsperaId || destino === undefined) {
      return;
    }
    let activo = true;
    getTramoViaje(lineaId, sentido, paraderoEsperaId, destino).then((data) => activo && setTramo(data));
    return () => {
      activo = false;
    };
  }, [lineaId, sentido, paraderoEsperaId, destino]);

  // Posición dentro del tramo (0 = paradero donde subió)
  const posicion =
    viaje && tramo ? tramo.findIndex(({ paradero }) => paradero.id === idsRecorrido(viaje)[viaje.paraderoActual]) : -1;
  const ultimo = tramo ? tramo.length - 1 : 0;
  const enCurso = viaje?.estado === "a_bordo";
  const ubicado = posicion !== -1;
  const llego = ubicado && posicion === ultimo;

  const terminar = useCallback(() => {
    finalizar();
    router.push("/viaje/fin");
  }, [finalizar, router]);

  // Simulación: la unidad avanza un paradero cada intervalo
  useEffect(() => {
    if (!enCurso || !ubicado || llego) {
      return;
    }
    const intervalo = setInterval(avanzarParadero, INTERVALO_PARADERO_MS);
    return () => clearInterval(intervalo);
  }, [enCurso, ubicado, llego, avanzarParadero]);

  useEffect(() => {
    if (enCurso && llego) {
      terminar();
    }
  }, [enCurso, llego, terminar]);

  const avisar = viaje?.avisarParaBajar ?? false;
  useEffect(() => {
    if (enCurso && avisar && ubicado && posicion === ultimo - 1 && !avisado.current) {
      avisado.current = true;
      Vibration.vibrate();
      mostrar("Bajas en el siguiente paradero");
    }
  }, [enCurso, avisar, ubicado, posicion, ultimo, mostrar]);

  // Atrás o el gesto de volver terminarían el viaje sin querer: se confirma antes
  usePreventRemove(enCurso, () => {
    Alert.alert("¿Terminar el viaje?", "Dejaremos de seguir tu viaje en vivo.", [
      { text: "Seguir viajando", style: "cancel" },
      { text: "Terminar", style: "destructive", onPress: terminar },
    ]);
  });

  if (!viaje) {
    return <Redirect href="/" />;
  }

  const bajada = tramo?.[ultimo];
  const restanteMin = tramo && bajada && ubicado ? bajada.minutos - tramo[posicion].minutos : undefined;
  const proximos = tramo && ubicado ? tramo.slice(posicion + 1, ultimo).slice(0, PROXIMOS_VISIBLES) : [];
  const siguientes = bajada && !llego ? [...proximos, bajada] : [];

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header
        leading={
          <View style={styles.enVivo}>
            <Play color={colors.ink} size={sizes.chipIcon} />
          </View>
        }
        eyebrow="A bordo"
        title={`${viaje.linea.nombre} → ${viaje.destino || bajada?.paradero.nombre || ""}`}
        right={
          restanteMin !== undefined && (
            <Text style={[typography.title, styles.ink]} accessibilityLabel={`Faltan ${formatearEta(restanteMin)}`}>
              {formatearEta(restanteMin)}
            </Text>
          )
        }
      />

      {!tramo || !ubicado || !bajada ? (
        <View style={styles.cargando}>
          <ActivityIndicator color={colors.ink} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.contenido}>
          <View style={styles.progreso}>
            <View style={styles.barra}>
              <View style={[styles.relleno, { width: `${((posicion + 1) / tramo.length) * 100}%` }]} />
            </View>
            <Text style={[typography.caption, styles.muted]}>
              {posicion + 1} de {tramo.length} paraderos
            </Text>
          </View>

          <Button
            label="Reportar algo ahora"
            variant="danger"
            icon={<TriangleAlert />}
            large
            fullWidth
            onPress={() => router.push("/reporte")}
          />

          {siguientes.length > 0 && (
            <>
              <Text style={[typography.overline, styles.muted]}>Siguientes paraderos</Text>
              <View>
                {siguientes.map(({ paradero, minutos }, i) => {
                  const esProximo = i === 0;
                  const esDestino = paradero.id === bajada.paradero.id;
                  return (
                    <View key={paradero.id} style={styles.fila}>
                      <View
                        style={[styles.punto, esDestino ? styles.puntoDestino : esProximo && styles.puntoProximo]}
                      />
                      <Text
                        style={[esProximo || esDestino ? typography.bodyStrong : typography.body, styles.ink, styles.nombre]}
                        numberOfLines={1}
                      >
                        {esDestino ? `${paradero.nombre} · bajas aquí` : paradero.nombre}
                      </Text>
                      <Text style={[typography.caption, styles.muted]}>
                        {formatearEta(minutos - tramo[posicion].minutos)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          <View style={styles.card}>
            <View style={styles.cardTexto}>
              <Text style={[typography.bodyStrong, styles.ink]}>Avísame para bajar</Text>
              <Text style={[typography.caption, styles.muted]}>Vibra 1 paradero antes de {bajada.paradero.nombre}</Text>
            </View>
            <Toggle
              value={viaje.avisarParaBajar}
              onValueChange={setAvisarParaBajar}
              accessibilityLabel="Avísame para bajar"
            />
          </View>
        </ScrollView>
      )}

      <View style={styles.pie}>
        <Button label="Terminar viaje" variant="secondary" onPress={terminar} disabled={!enCurso} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  enVivo: {
    width: sizes.iconButton,
    height: sizes.iconButton,
    borderRadius: radii.md,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  cargando: {
    flex: 1,
    justifyContent: "center",
  },
  contenido: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  progreso: {
    gap: spacing.xs,
  },
  barra: {
    height: sizes.progressHeight,
    borderRadius: radii.pill,
    backgroundColor: colors.line,
    overflow: "hidden",
  },
  relleno: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: sizes.timelineRowPaddingY,
    borderBottomWidth: borderWidths.thin,
    borderBottomColor: colors.line,
  },
  punto: {
    width: sizes.timelineDot,
    height: sizes.timelineDot,
    borderRadius: radii.pill,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  puntoProximo: {
    backgroundColor: colors.yellow,
  },
  puntoDestino: {
    backgroundColor: colors.red,
  },
  nombre: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: sizes.cardPadding,
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
  },
  cardTexto: {
    flex: 1,
    gap: spacing.xxs,
  },
  pie: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
});
