import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { AlarmClock, Star, TriangleAlert } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Chip, Header, IconButton, ListItem, Mapa, useToast } from "@/components";
import { UMBRAL_OCUPACION_LIVE_MIN, VENTANA_PARADERO_H } from "@/config/reportes";
import {
  alternarParaderoFavorito,
  esParaderoFavorito,
  getAlertaDeParadero,
  getResumenParadero,
} from "@/data/repositorio";
import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
import type { AlertaDiaria, EstadoParadero, ResumenParadero } from "@/types";
import {
  etiquetaOcupacion,
  formatearEta,
  haceCuanto,
  minutosDesde,
  textoEsperaParadero,
  textoProximaUnidad,
} from "@/utils/formato";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "no_encontrado" }
  | { tipo: "ok"; resumen: ResumenParadero; alerta: AlertaDiaria | null };

// "Lleno · hace 4 min"; sin ocupación, solo cuándo se reportó
function ChipOcupacion({ estado }: { estado: EstadoParadero | null }) {
  if (!estado) {
    return <Chip label="Sin reportes" />;
  }
  const label = estado.ocupacion
    ? `${etiquetaOcupacion(estado.ocupacion)} · ${haceCuanto(estado.creadoEn)}`
    : `Reportado ${haceCuanto(estado.creadoEn)}`;
  return <Chip label={label} state={minutosDesde(estado.creadoEn) < UMBRAL_OCUPACION_LIVE_MIN ? "live" : "default"} />;
}

// F3_02 · Detalle de paradero favorito
export default function DetalleParadero() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mostrar } = useToast();

  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [favorito, setFavorito] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Devuelve la limpieza que descarta una respuesta que llega tarde
  const cargar = useCallback(() => {
    let activo = true;
    Promise.all([getResumenParadero(id), esParaderoFavorito(id), getAlertaDeParadero(id)])
      .then(([resumen, marcado, alerta]) => {
        if (!activo) {
          return;
        }
        setFavorito(marcado);
        setEstado(resumen ? { tipo: "ok", resumen, alerta } : { tipo: "no_encontrado" });
      })
      // Si ya se mostraba el paradero, se conserva lo anterior
      .catch(() => activo && setEstado((actual) => (actual.tipo === "ok" ? actual : { tipo: "error" })));
    return () => {
      activo = false;
    };
  }, [id]);

  // Al volver de la alerta o del reporte se recarga sin mostrar de nuevo el
  // estado de carga, para reflejar lo que cambió
  useFocusEffect(cargar);

  const reintentar = () => {
    setEstado({ tipo: "cargando" });
    cargar();
  };

  const alternar = async () => {
    // Evita dos toques seguidos mientras responde el repositorio
    if (guardando) {
      return;
    }
    setGuardando(true);
    try {
      const marcado = await alternarParaderoFavorito(id);
      setFavorito(marcado);
      mostrar(marcado ? "Guardado en Favoritos" : "Quitado de Favoritos");
    } finally {
      setGuardando(false);
    }
  };

  if (estado.tipo !== "ok") {
    return (
      <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
        <Header title="Paradero" />
        <View style={styles.estado}>
          {estado.tipo === "cargando" && (
            <>
              <ActivityIndicator color={colors.ink} />
              <Text style={[typography.body, styles.muted, styles.centrado]}>Cargando paradero…</Text>
            </>
          )}
          {estado.tipo === "error" && (
            <>
              <Text style={[typography.body, styles.muted, styles.centrado]}>
                No pudimos cargar el paradero. Revisa tu conexión e inténtalo otra vez.
              </Text>
              <Button label="Reintentar" variant="secondary" onPress={reintentar} />
            </>
          )}
          {estado.tipo === "no_encontrado" && (
            <>
              <Text style={[typography.title, styles.ink, styles.centrado]}>No encontramos este paradero</Text>
              <Text style={[typography.body, styles.muted, styles.centrado]}>
                Puede que ya no exista o que el enlace esté mal.
              </Text>
              <Button label="Volver" variant="secondary" onPress={() => router.back()} />
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const { resumen, alerta } = estado;
  const { paradero, proximas } = resumen;
  // Cada confirmación cuenta como un reporte más
  const reportesSeguridad = resumen.seguridad.reduce((total, reporte) => total + reporte.confirmaciones, 0);

  const abrirAlerta = () =>
    router.push(
      alerta ? { pathname: "/alerta", params: { id: alerta.id } } : { pathname: "/alerta", params: { paraderoId: id } },
    );

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header
        title={paradero.nombre}
        subtitle={`${paradero.direccion} · ${paradero.distrito}`}
        right={
          <IconButton
            icon={<Star fill={favorito ? colors.ink : "none"} />}
            tono={favorito ? "destacado" : undefined}
            onPress={alternar}
            accessibilityLabel={favorito ? "Quitar de Favoritos" : "Guardar en Favoritos"}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.contenido}>
        <Mapa paraderos={[paradero]} etiqueta="Ubicación del paradero" estilo={styles.mapa} />

        <View style={styles.chips}>
          <ChipOcupacion estado={resumen.estado} />
          {resumen.estado?.espera && <Chip label={textoEsperaParadero(resumen.estado.espera)} />}
          {reportesSeguridad === 0 ? (
            <Chip label={`Seguro ${VENTANA_PARADERO_H} h`} />
          ) : (
            <Chip
              label={`${reportesSeguridad} ${reportesSeguridad === 1 ? "reporte" : "reportes"} de seguridad`}
              state="alert"
              icon={<TriangleAlert />}
            />
          )}
        </View>

        <Text style={[typography.overline, styles.muted]}>Próximas unidades</Text>
        {proximas.length === 0 ? (
          <Text style={[typography.body, styles.muted]}>Ninguna línea registrada pasa por este paradero.</Text>
        ) : (
          <View style={styles.lista}>
            {proximas.map((unidad) => (
              <ListItem
                key={unidad.linea.id}
                badge={unidad.linea.codigo}
                title={unidad.linea.nombre}
                subtitle={textoProximaUnidad(unidad)}
                trailing={
                  unidad.fuente === "sin_datos" ? (
                    <Text style={[typography.bodyStrong, styles.muted]}>~{unidad.minutos}</Text>
                  ) : (
                    formatearEta(unidad.minutos)
                  )
                }
                onPress={() => router.push({ pathname: "/ruta/[id]", params: { id: unidad.linea.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.pie}>
        <Button
          label={alerta ? "Editar alerta del paradero" : "Suscribirme a alertas del paradero"}
          icon={<AlarmClock />}
          onPress={abrirAlerta}
          fullWidth
        />
        <Button
          label="Reportar este paradero"
          variant="secondary"
          onPress={() => router.push({ pathname: "/reporte/paradero", params: { paraderoId: id } })}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  contenido: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  mapa: {
    height: sizes.miniMap,
    borderRadius: radii.lg,
    borderWidth: borderWidths.thin,
    borderColor: colors.line,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  // ListItem trae su propio margen lateral de 16
  lista: {
    marginHorizontal: -spacing.lg,
  },
  pie: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  estado: {
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  centrado: {
    textAlign: "center",
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
});
