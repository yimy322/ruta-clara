import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { CircleAlert, Clock } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEstilos, useTema } from "@/context/TemaContext";
import { Button, CardRuta, Chip, EsqueletoRuta, EstadoPantalla, Header, Mapa, useToast } from "@/components";
import { buscarRutas, getDestino, getUbicacionUsuario } from "@/data/repositorio";
import { borderWidths, radii, sizes, spacing, type Tema } from "@/theme";
import type { Coordenada, OpcionRuta, TipoUnidad } from "@/types";
import { etiquetaTipo } from "@/utils/formato";
import { abrirWhatsApp } from "@/utils/soporte";

// Tarjetas del esqueleto de carga (E2)
const ESQUELETOS = [0, 1, 2];

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "ok"; opciones: OpcionRuta[] };

type FiltroTipo = TipoUnidad | "todos";

const FILTROS: { valor: FiltroTipo; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "combi", label: "Combi" },
  { valor: "custer", label: "Custer" },
  { valor: "micro", label: "Micro" },
];

// F1_06 · Resultados de rutas
export default function Rutas() {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const router = useRouter();
  const { mostrar } = useToast();
  const { origen = "Mi ubicación", destino = "" } = useLocalSearchParams<{ origen?: string; destino?: string }>();

  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  // Cambia para volver a pedir las rutas (botón Reintentar)
  const [intento, setIntento] = useState(0);
  const [usuario, setUsuario] = useState<Coordenada>();
  const [punto, setPunto] = useState<Coordenada | null>(null);
  const [filtro, setFiltro] = useState<FiltroTipo>("todos");
  const [masBarato, setMasBarato] = useState(false);

  useEffect(() => {
    let activo = true;
    getUbicacionUsuario().then((data) => activo && setUsuario(data));
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;
    getDestino(destino).then((data) => activo && setPunto(data));
    return () => {
      activo = false;
    };
  }, [destino]);

  useEffect(() => {
    let activo = true;
    buscarRutas(origen, destino)
      .then((opciones) => activo && setEstado({ tipo: "ok", opciones }))
      .catch(() => activo && setEstado({ tipo: "error" }));
    return () => {
      activo = false;
    };
  }, [origen, destino, intento]);

  const reintentar = () => {
    setEstado({ tipo: "cargando" });
    setIntento((n) => n + 1);
  };

  const opciones = estado.tipo === "ok" ? estado.opciones : [];
  // El repositorio ordena por ETA: la primera es la recomendada
  const recomendadaId = opciones[0]?.linea.id;

  const filtradas = opciones.filter((opcion) => filtro === "todos" || opcion.linea.tipo === filtro);
  const visibles = masBarato
    ? [...filtradas].sort((a, b) => a.linea.pasaje - b.linea.pasaje || a.etaMin - b.etaMin)
    : filtradas;

  const contactar = async () => {
    if (!(await abrirWhatsApp())) {
      mostrar("No se pudo abrir WhatsApp. Inténtalo de nuevo.");
    }
  };

  const renderLista = () => {
    if (opciones.length === 0) {
      return (
        <View style={styles.estado}>
          <Text style={[typography.title, styles.ink, styles.centrado]}>No encontramos rutas a «{destino}»</Text>
          <Text style={[typography.body, styles.muted, styles.centrado]}>
            Prueba con un distrito o centro comercial.
          </Text>
          <Button label="Cambiar destino" variant="secondary" onPress={() => router.back()} />
        </View>
      );
    }
    if (visibles.length === 0 && filtro !== "todos") {
      return (
        <View style={styles.estado}>
          <Text style={[typography.body, styles.muted, styles.centrado]}>
            No hay rutas en {etiquetaTipo(filtro).toLowerCase()} a {destino}.
          </Text>
          <Button label="Ver todas" variant="tertiary" onPress={() => setFiltro("todos")} />
        </View>
      );
    }
    return visibles.map((opcion) => (
      <CardRuta
        key={opcion.linea.id}
        opcion={opcion}
        recomendada={opcion.linea.id === recomendadaId}
        onPress={() => router.push({ pathname: "/ruta/[id]", params: { id: opcion.linea.id, destino } })}
      />
    ));
  };

  const titulo = `${origen} → ${destino}`;

  // E2 · Cargando rutas: esqueleto en vez de spinner, sin mapa ni filtros
  if (estado.tipo === "cargando") {
    return (
      <SafeAreaView style={[styles.screen, styles.canvas]} edges={["left", "right", "bottom"]}>
        <Header title={titulo} subtitle="Hoy, salir ahora" />
        <ScrollView contentContainerStyle={styles.contenido} accessibilityLabel="Buscando las mejores rutas">
          <View style={styles.buscando}>
            <Clock color={colors.inkMuted} size={sizes.chipIcon} />
            <Text style={[typography.captionStrong, styles.muted]} accessibilityLiveRegion="polite">
              Buscando las mejores rutas…
            </Text>
          </View>
          {ESQUELETOS.map((i) => (
            <EsqueletoRuta key={i} indice={i} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // E7 · Error del sistema: reemplaza el mapa y los filtros
  if (estado.tipo === "error") {
    return (
      <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
        <Header title={titulo} subtitle="Hoy, salir ahora · Hora punta" />
        <ScrollView contentContainerStyle={styles.centroVertical}>
          <EstadoPantalla
            Icono={CircleAlert}
            tono="error"
            titulo="No pudimos cargar las rutas"
            texto="Disculpa, el servicio no responde en este momento. No es un problema de tu celular."
            acciones={
              <>
                <Button label="Reintentar" onPress={reintentar} fullWidth />
                <Button label="Escríbenos por WhatsApp" variant="tertiary" onPress={contactar} fullWidth />
              </>
            }
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header title={titulo} subtitle="Hoy, salir ahora · Hora punta" />
      <ScrollView contentContainerStyle={styles.contenido}>
        {/* Una línea recta al destino: no hay trazado real de las rutas (decisión 70) */}
        <Mapa usuario={usuario} destino={punto ?? undefined} etiqueta="Mini-mapa" estilo={styles.mapa} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtrosScroll}
          contentContainerStyle={styles.filtros}
        >
          {FILTROS.map(({ valor, label }) => (
            <Chip
              key={valor}
              label={label}
              state={filtro === valor ? "selected" : "default"}
              onPress={() => setFiltro(valor)}
            />
          ))}
          <Chip
            label="+ barato"
            state={masBarato ? "selected" : "default"}
            onPress={() => setMasBarato((actual) => !actual)}
          />
        </ScrollView>

        {renderLista()}
      </ScrollView>
    </SafeAreaView>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    canvas: {
      backgroundColor: colors.canvas,
    },
    buscando: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingTop: spacing.sm,
    },
    centroVertical: {
      flexGrow: 1,
      justifyContent: "center",
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
    // Los chips llegan hasta el borde de la pantalla, como en Figma
    filtrosScroll: {
      marginHorizontal: -spacing.lg,
    },
    filtros: {
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    estado: {
      alignItems: "center",
      gap: spacing.md,
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
