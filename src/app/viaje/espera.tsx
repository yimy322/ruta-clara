import { Redirect, useRouter } from "expo-router";
import { ArrowLeft, CircleDot, Play } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Chip, IconButton, Mapa, useToast } from "@/components";
import { INTERVALO_ETA_MS } from "@/config/simulacion";
import { useViaje } from "@/context/ViajeContext";
import { getReportesCercanos, getUnidadEnCamino } from "@/data/repositorio";
import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
import type { Reporte, UnidadEnCamino } from "@/types";
import {
  etiquetaOcupacion,
  etiquetaTipo,
  etiquetaVelocidad,
  formatearDistancia,
  formatearEta,
  haceCuanto,
  haceSegundos,
} from "@/utils/formato";

// ETA en la que se avisa que la unidad está llegando
const ETA_AVISO_MIN = 2;
// La ETA simulada no baja de aquí: la unidad "llega" y se espera a que el usuario suba
const ETA_MINIMA_MIN = 1;
// Cada cuánto se refresca el "Actualizado hace X s"
const RELOJ_MS = 1000;
// Reportes que aportan un comentario útil mientras se espera
const TIPOS_COMENTARIO: Reporte["tipo"][] = ["transito", "desvio", "seguridad"];

// F1_08 · Monitoreo en vivo
export default function Espera() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mostrar } = useToast();
  const { viaje, subir } = useViaje();

  // undefined = cargando; null = no hay unidades reportadas
  const [unidad, setUnidad] = useState<UnidadEnCamino | null>();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  // Minutos que la simulación ya le restó a la ETA inicial
  const [avance, setAvance] = useState(0);
  const [actualizadoEn, setActualizadoEn] = useState<number>();
  const [ahora, setAhora] = useState(() => Date.now());
  const avisado = useRef(false);

  // Alto de los controles flotantes, para que el mapa no ponga puntos debajo
  const [altoArriba, setAltoArriba] = useState(0);
  const [altoAbajo, setAltoAbajo] = useState(0);

  const lineaId = viaje?.linea.id;
  const paradero = viaje?.paraderoEspera;

  useEffect(() => {
    if (!lineaId || !paradero) {
      return;
    }
    let activo = true;
    getUnidadEnCamino(lineaId, paradero.id).then((data) => {
      if (activo) {
        setUnidad(data);
        setActualizadoEn(data ? new Date(data.actualizadoEn).getTime() : undefined);
      }
    });
    getReportesCercanos(paradero.lat, paradero.lng).then((data) => activo && setReportes(data));
    return () => {
      activo = false;
    };
  }, [lineaId, paradero]);

  const etaMin = unidad ? Math.max(unidad.etaMin - avance, ETA_MINIMA_MIN) : undefined;
  const enCamino = etaMin !== undefined && etaMin > ETA_MINIMA_MIN;

  // Simulación: la ETA baja 1 min cada intervalo hasta que la unidad llega
  useEffect(() => {
    if (!enCamino) {
      return;
    }
    const intervalo = setInterval(() => {
      setAvance((n) => n + 1);
      setActualizadoEn(Date.now());
    }, INTERVALO_ETA_MS);
    return () => clearInterval(intervalo);
  }, [enCamino]);

  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), RELOJ_MS);
    return () => clearInterval(reloj);
  }, []);

  useEffect(() => {
    if (etaMin !== undefined && etaMin <= ETA_AVISO_MIN && !avisado.current) {
      avisado.current = true;
      mostrar("¡Tu carro está llegando!");
    }
  }, [etaMin, mostrar]);

  if (!viaje || !paradero) {
    return <Redirect href="/" />;
  }

  const alto = (setter: (valor: number) => void) => (e: LayoutChangeEvent) => setter(e.nativeEvent.layout.height);

  // La unidad se acerca al paradero en proporción a lo que bajó la ETA
  const fraccion = unidad && etaMin !== undefined ? etaMin / unidad.etaMin : 1;
  const posicion = unidad && {
    lat: paradero.lat + (unidad.lat - paradero.lat) * fraccion,
    lng: paradero.lng + (unidad.lng - paradero.lng) * fraccion,
  };
  const comentario = reportes.find((reporte) => reporte.nota && TIPOS_COMENTARIO.includes(reporte.tipo));
  const segundos = actualizadoEn === undefined ? 0 : Math.max(Math.floor((ahora - actualizadoEn) / 1000), 0);

  const yaSubi = () => {
    subir();
    router.replace("/viaje/a-bordo");
  };

  return (
    <View style={styles.screen}>
      {/* El usuario espera en el paradero, así que se ubica ahí */}
      <Mapa
        estilo={StyleSheet.absoluteFill}
        usuario={paradero}
        etiquetaUsuario="Tú · paradero"
        unidades={
          unidad && posicion
            ? [
                {
                  linea: unidad.linea,
                  ...posicion,
                  etiqueta: `${unidad.linea.nombre} · ${formatearDistancia(unidad.distanciaM * fraccion)}`,
                  icono: <Play />,
                },
              ]
            : []
        }
        seguimiento
        margen={{ top: altoArriba, bottom: altoAbajo }}
      />

      <SafeAreaView style={styles.capa} edges={["left", "right"]}>
        <View style={[styles.arriba, { paddingTop: insets.top + spacing.sm }]} onLayout={alto(setAltoArriba)}>
          <View style={styles.header}>
            <IconButton icon={<ArrowLeft />} accessibilityLabel="Volver" onPress={() => router.back()} />
            <View style={styles.paradero}>
              <Text style={[typography.overline, styles.muted]} numberOfLines={1}>
                Espera en
              </Text>
              <Text style={[typography.captionStrong, styles.ink]} numberOfLines={1}>
                {paradero.nombre}
              </Text>
            </View>
          </View>
          <View style={styles.zona}>
            <Chip
              label={`${reportes.length} ${reportes.length === 1 ? "reporte" : "reportes"} en tu zona`}
              icon={<CircleDot />}
            />
          </View>
        </View>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]} onLayout={alto(setAltoAbajo)}>
          <View style={styles.grabber} />

          {unidad === undefined && <ActivityIndicator color={colors.ink} />}

          {unidad === null && (
            <Text style={[typography.body, styles.muted]}>
              Todavía no hay reportes de ubicación de {viaje.linea.nombre}. Si la ves, repórtala.
            </Text>
          )}

          {unidad && etaMin !== undefined && (
            <>
              <View style={styles.eta}>
                <View>
                  <Text style={[typography.overline, styles.muted]}>
                    Tu {etiquetaTipo(unidad.linea.tipo).toLowerCase()} llega en
                  </Text>
                  <Text style={[typography.display, styles.ink]} accessibilityLiveRegion="polite">
                    {formatearEta(etaMin)}
                  </Text>
                </View>
                <Text style={[typography.caption, styles.muted, styles.fuente]}>
                  Ubicación por{"\n"}GPS + {unidad.pasajeros} {unidad.pasajeros === 1 ? "pasajero" : "pasajeros"}
                </Text>
              </View>

              <View style={styles.chips}>
                {unidad.ocupacion && <Chip label={etiquetaOcupacion(unidad.ocupacion)} state="live" />}
                {unidad.velocidad && <Chip label={etiquetaVelocidad(unidad.velocidad)} />}
                <Chip label={`Actualizado ${haceSegundos(segundos)}`} />
              </View>
            </>
          )}

          {comentario && (
            <View style={styles.card}>
              <Text style={[typography.caption, styles.ink]}>
                <Text style={typography.captionStrong}>Comunidad:</Text> “{comentario.nota}” ·{" "}
                {haceCuanto(comentario.creadoEn)}
              </Text>
            </View>
          )}

          <View style={styles.acciones}>
            <Button label="Reportar" variant="secondary" onPress={() => router.push("/reporte")} />
            <View style={styles.principal}>
              <Button label="Ya subí al carro" onPress={yaSubi} fullWidth />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.map,
  },
  capa: {
    flex: 1,
    justifyContent: "space-between",
  },
  arriba: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  paradero: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  zona: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  sheet: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: borderWidths.regular,
    borderBottomWidth: 0,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  grabber: {
    alignSelf: "center",
    width: sizes.grabberWidth,
    height: sizes.grabberHeight,
    borderRadius: radii.pill,
    backgroundColor: colors.line,
  },
  eta: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  fuente: {
    flexShrink: 1,
    textAlign: "right",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
  },
  acciones: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  principal: {
    flex: 1,
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
});
