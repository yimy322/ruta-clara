import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleDot, Star } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Button,
  GraficoAfluencia,
  Header,
  IconButton,
  ListItem,
  Mapa,
  Segmented,
  TarjetaDato,
  useToast,
} from "@/components";
import { useViaje } from "@/context/ViajeContext";
import { alternarFavorita, esFavorita, getLinea, getRecorrido, getUbicacionUsuario } from "@/data/repositorio";
import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
import type { Coordenada, Linea, Paradero, Sentido } from "@/types";
import { etiquetaTipo, formatearDistancia, formatearPasaje, textoRecorrido } from "@/utils/formato";
import { distanciaMetros } from "@/utils/geo";

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "no_encontrada" } | { tipo: "ok"; linea: Linea };

type ParaderoCercano = { paradero: Paradero; distanciaM: number };

const SENTIDOS: { valor: Sentido; label: string }[] = [
  { valor: "ida", label: "Ida" },
  { valor: "vuelta", label: "Vuelta" },
];

// Cantidad de paraderos en la lista, como en Figma
const PARADEROS_VISIBLES = 2;

// F1_07 · Detalle de ruta
export default function DetalleRuta() {
  const router = useRouter();
  const { id, destino = "" } = useLocalSearchParams<{ id: string; destino?: string }>();
  const { mostrar } = useToast();
  const { iniciarEspera } = useViaje();

  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  // Cambia para volver a pedir la línea (botón Reintentar)
  const [intento, setIntento] = useState(0);
  const [favorita, setFavorita] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [sentido, setSentido] = useState<Sentido>("ida");
  const [recorrido, setRecorrido] = useState<Paradero[]>([]);
  const [usuario, setUsuario] = useState<Coordenada>();

  useEffect(() => {
    let activo = true;
    getUbicacionUsuario().then((data) => activo && setUsuario(data));
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;
    Promise.all([getLinea(id), esFavorita(id)])
      .then(([linea, marcada]) => {
        if (!activo) {
          return;
        }
        setFavorita(marcada);
        setEstado(linea ? { tipo: "ok", linea } : { tipo: "no_encontrada" });
      })
      .catch(() => activo && setEstado({ tipo: "error" }));
    return () => {
      activo = false;
    };
  }, [id, intento]);

  useEffect(() => {
    let activo = true;
    getRecorrido(id, sentido).then((data) => activo && setRecorrido(data));
    return () => {
      activo = false;
    };
  }, [id, sentido]);

  const reintentar = () => {
    setEstado({ tipo: "cargando" });
    setIntento((n) => n + 1);
  };

  const cercanos: ParaderoCercano[] = usuario
    ? recorrido
        .map((paradero) => ({
          paradero,
          distanciaM: distanciaMetros(usuario.lat, usuario.lng, paradero.lat, paradero.lng),
        }))
        .sort((a, b) => a.distanciaM - b.distanciaM)
    : [];

  const alternar = async () => {
    // Evita dos toques seguidos mientras responde el repositorio
    if (guardando) {
      return;
    }
    setGuardando(true);
    try {
      const marcada = await alternarFavorita(id);
      setFavorita(marcada);
      mostrar(marcada ? "Guardado en Favoritos" : "Quitado de Favoritos");
    } finally {
      setGuardando(false);
    }
  };

  if (estado.tipo !== "ok") {
    return (
      <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
        <Header title="Detalle de ruta" />
        <View style={styles.estado}>
          {estado.tipo === "cargando" && (
            <>
              <ActivityIndicator color={colors.ink} />
              <Text style={[typography.body, styles.muted, styles.centrado]}>Cargando ruta…</Text>
            </>
          )}
          {estado.tipo === "error" && (
            <>
              <Text style={[typography.body, styles.muted, styles.centrado]}>
                No pudimos cargar la ruta. Revisa tu conexión e inténtalo otra vez.
              </Text>
              <Button label="Reintentar" variant="secondary" onPress={reintentar} />
            </>
          )}
          {estado.tipo === "no_encontrada" && (
            <>
              <Text style={[typography.title, styles.ink, styles.centrado]}>No encontramos esta línea</Text>
              <Text style={[typography.body, styles.muted, styles.centrado]}>
                Puede que ya no opere o que el enlace esté mal.
              </Text>
              <Button label="Volver" variant="secondary" onPress={() => router.back()} />
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const { linea } = estado;
  const paraderoEspera = cercanos[0]?.paradero;

  const tomarRuta = () => {
    if (!paraderoEspera) {
      return;
    }
    iniciarEspera(linea, paraderoEspera, destino, sentido);
    router.push("/viaje/espera");
  };

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header
        large
        title={linea.nombre}
        subtitle={`${etiquetaTipo(linea.tipo)} · ${linea.empresa}`}
        right={
          <IconButton
            icon={<Star />}
            active={favorita}
            onPress={alternar}
            accessibilityLabel={favorita ? "Quitar de Favoritos" : "Guardar en Favoritos"}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.contenido}>
        <Segmented opciones={SENTIDOS} valor={sentido} onChange={setSentido} />

        <Mapa
          usuario={usuario}
          paraderos={recorrido}
          recorrido
          etiqueta={textoRecorrido(linea.tramo, sentido)}
          estilo={styles.mapa}
        />

        <View style={styles.datos}>
          <TarjetaDato label="Pasaje" valor={formatearPasaje(linea.pasaje)} />
          <TarjetaDato label="Frecuencia" valor={`c/ ${linea.frecuenciaMin} min`} />
          <TarjetaDato label="Horario" valor={linea.horario} />
        </View>

        <Text style={[typography.overline, styles.muted]}>Mayor afluencia</Text>
        <GraficoAfluencia valores={linea.afluencia} />

        <Text style={[typography.overline, styles.muted]}>Paraderos cercanos</Text>
        <View style={styles.lista}>
          {cercanos.slice(0, PARADEROS_VISIBLES).map(({ paradero, distanciaM }) => (
            <ListItem
              key={paradero.id}
              badge={<CircleDot />}
              title={paradero.nombre}
              trailing={formatearDistancia(distanciaM)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.pie}>
        <Button label="Tomar esta ruta · Ver en vivo" onPress={tomarRuta} disabled={!paraderoEspera} fullWidth />
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
    height: sizes.routeMap,
    borderRadius: radii.lg,
    borderWidth: borderWidths.thin,
    borderColor: colors.line,
  },
  datos: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  // ListItem trae su propio margen lateral de 16
  lista: {
    marginHorizontal: -spacing.lg,
  },
  pie: {
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
