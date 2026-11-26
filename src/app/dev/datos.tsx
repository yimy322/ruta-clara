import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEstilos, useTema } from "@/context/TemaContext";
import { Chip, FilaAjuste, Header, ListItem } from "@/components";
import { useColaReportes } from "@/context/ColaReportesContext";
import { buscarRutas } from "@/data/repositorio";
import { getSimulacion, setSimulacion, type Simulacion } from "@/data/simulacion";
import { radii, spacing, type Tema } from "@/theme";
import type { OpcionRuta, TipoUnidad } from "@/types";
import { formatearEta, formatearPasaje } from "@/utils/formato";

// Pantalla de desarrollo: verifica que el repositorio devuelva datos y
// permite forzar los estados de error, vacío y sin conexión (E3–E7).
// Se abre desde "Ver datos" en Mi perfil.
const ORIGEN = "Mi ubicación";
const DESTINO = "Jockey Plaza";

const nombreTipo: Record<TipoUnidad, string> = {
  combi: "Combi",
  custer: "Custer",
  micro: "Micro",
};

// Interruptores del modo de prueba (src/data/simulacion.ts)
const INTERRUPTORES: { clave: keyof Simulacion; titulo: string; subtitulo: string }[] = [
  { clave: "forzarError", titulo: "Forzar error del sistema", subtitulo: "Resultados de rutas falla (E7)" },
  { clave: "forzarVacio", titulo: "Forzar listas vacías", subtitulo: "Favoritos, Perfil y Alertas vacíos (E4–E6)" },
  { clave: "forzarSinRed", titulo: "Simular sin conexión", subtitulo: "Los reportes van a la cola (E3)" },
];

export default function Datos() {
  const { colors } = useTema();
  const styles = useEstilos(crearEstilos);

  const [opciones, setOpciones] = useState<OpcionRuta[] | null>(null);
  const [error, setError] = useState(false);
  const [simulacion, setEstadoSimulacion] = useState<Simulacion>(getSimulacion);
  const { reintentar } = useColaReportes();

  const cambiar = (clave: keyof Simulacion, valor: boolean) => {
    setSimulacion({ [clave]: valor });
    setEstadoSimulacion(getSimulacion());
    // Al volver la "conexión" simulada, se envía lo que quedó en la cola
    if (clave === "forzarSinRed" && !valor) {
      void reintentar();
    }
  };

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
        <Text style={styles.seccion}>Modo de prueba</Text>
        <View style={styles.card}>
          {INTERRUPTORES.map(({ clave, titulo, subtitulo }) => (
            <FilaAjuste
              key={clave}
              titulo={titulo}
              subtitulo={subtitulo}
              valor={simulacion[clave]}
              onValueChange={(valor) => cambiar(clave, valor)}
            />
          ))}
        </View>
        <Text style={styles.seccion}>Rutas a {DESTINO}</Text>
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

const crearEstilos = ({ colors, typography }: Tema) =>
  StyleSheet.create({
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
    seccion: {
      ...typography.overline,
      color: colors.inkMuted,
    },
    muted: {
      ...typography.body,
      color: colors.inkMuted,
    },
  });
