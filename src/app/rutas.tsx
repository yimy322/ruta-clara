import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, CardRuta, Chip, Header, Mapa } from "@/components";
import { buscarRutas, getUbicacionUsuario } from "@/data/repositorio";
import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
import type { Coordenada, OpcionRuta, TipoUnidad } from "@/types";
import { etiquetaTipo } from "@/utils/formato";

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
  const router = useRouter();
  const { origen = "Mi ubicación", destino = "" } = useLocalSearchParams<{ origen?: string; destino?: string }>();

  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  // Cambia para volver a pedir las rutas (botón Reintentar)
  const [intento, setIntento] = useState(0);
  const [usuario, setUsuario] = useState<Coordenada>();
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

  const renderLista = () => {
    if (estado.tipo === "cargando") {
      return (
        <View style={styles.estado}>
          <ActivityIndicator color={colors.ink} />
          <Text style={[typography.body, styles.muted, styles.centrado]}>Buscando rutas…</Text>
        </View>
      );
    }
    if (estado.tipo === "error") {
      return (
        <View style={styles.estado}>
          <Text style={[typography.body, styles.muted, styles.centrado]}>
            No pudimos cargar las rutas. Revisa tu conexión e inténtalo otra vez.
          </Text>
          <Button label="Reintentar" variant="secondary" onPress={reintentar} />
        </View>
      );
    }
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
        onPress={() => router.push({ pathname: "/ruta/[id]", params: { id: opcion.linea.id } })}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header title={`${origen} → ${destino}`} subtitle="Hoy, salir ahora · Hora punta" />
      <ScrollView contentContainerStyle={styles.contenido}>
        {/* TODO Fase 6: trazos de las rutas y marcador del destino */}
        <Mapa usuario={usuario} estilo={styles.mapa} />

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
