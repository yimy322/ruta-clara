import { useFocusEffect, useRouter } from "expo-router";
import { Play, Redo, Settings, Star, TriangleAlert, Waves, type LucideIcon } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Chip, IconButton, ItemNotificacion, useToast } from "@/components";
import { useNotificaciones } from "@/context/NotificacionesContext";
import { useViaje } from "@/context/ViajeContext";
import { getNotificaciones, getViajeDeAlerta, marcarNotificacionLeida } from "@/data/repositorio";
import { colors, spacing, typography } from "@/theme";
import type { Notificacion, TipoNotificacion } from "@/types";
import { formatearDia, formatearHora } from "@/utils/formato";

type Filtro = "todas" | "mis_rutas" | "transito" | "seguridad";

// Logro no tiene filtro propio: solo aparece en Todas
const FILTROS: { valor: Filtro; label: string; tipos: TipoNotificacion[]; vacio: string }[] = [
  {
    valor: "todas",
    label: "Todas",
    tipos: ["llegada", "desvio", "transito", "seguridad", "logro"],
    vacio: "No tienes alertas por ahora",
  },
  { valor: "mis_rutas", label: "Mis rutas", tipos: ["llegada", "desvio"], vacio: "No tienes alertas de tus rutas" },
  { valor: "transito", label: "Tránsito", tipos: ["transito"], vacio: "No tienes alertas de tránsito" },
  { valor: "seguridad", label: "Seguridad", tipos: ["seguridad"], vacio: "No tienes alertas de seguridad" },
];

const ICONO: Record<TipoNotificacion, LucideIcon> = {
  llegada: Play,
  desvio: Redo,
  transito: Waves,
  seguridad: TriangleAlert,
  logro: Star,
};

type Seccion = { titulo: string; notificaciones: Notificacion[] };

// Hoy, Ayer y Anteriores, sin las secciones vacías. Llegan ordenadas de la
// más reciente a la más antigua.
function agrupar(notificaciones: Notificacion[]): Seccion[] {
  const hoy = new Date().toDateString();
  const fechaAyer = new Date();
  fechaAyer.setDate(fechaAyer.getDate() - 1);
  const ayer = fechaAyer.toDateString();

  const secciones: Seccion[] = [
    { titulo: "Hoy", notificaciones: [] },
    { titulo: "Ayer", notificaciones: [] },
    { titulo: "Anteriores", notificaciones: [] },
  ];
  for (const notificacion of notificaciones) {
    const dia = new Date(notificacion.fecha).toDateString();
    secciones[dia === hoy ? 0 : dia === ayer ? 1 : 2].notificaciones.push(notificacion);
  }
  return secciones.filter((seccion) => seccion.notificaciones.length > 0);
}

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "ok"; notificaciones: Notificacion[] };

// F3_04 · Centro de notificaciones
export default function Alertas() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mostrar } = useToast();
  const { viaje, iniciarEspera } = useViaje();
  const { actualizarNoLeidas } = useNotificaciones();

  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [filtro, setFiltro] = useState<Filtro>("todas");

  // Devuelve la limpieza que descarta una respuesta que llega tarde
  const cargar = useCallback(() => {
    let activo = true;
    getNotificaciones()
      .then((notificaciones) => activo && setEstado({ tipo: "ok", notificaciones }))
      // Si ya se mostraban los avisos, se conserva lo anterior
      .catch(() => activo && setEstado((actual) => (actual.tipo === "ok" ? actual : { tipo: "error" })));
    actualizarNoLeidas();
    return () => {
      activo = false;
    };
  }, [actualizarNoLeidas]);

  // Recarga al volver a la tab (p. ej. después de simular un aviso)
  useFocusEffect(cargar);

  const reintentar = () => {
    setEstado({ tipo: "cargando" });
    cargar();
  };

  // Con un viaje en curso se vuelve a él; si no, se espera la unidad de la alerta
  const abrirLlegada = async (notificacion: Notificacion) => {
    if (viaje?.estado === "esperando") {
      router.push("/viaje/espera");
      return;
    }
    if (viaje?.estado === "a_bordo") {
      router.push("/viaje/a-bordo");
      return;
    }
    const datos = notificacion.alertaId ? await getViajeDeAlerta(notificacion.alertaId) : null;
    if (!datos) {
      // La alerta se eliminó después del aviso: se muestra la línea
      if (notificacion.lineaId) {
        router.push({ pathname: "/ruta/[id]", params: { id: notificacion.lineaId } });
      }
      return;
    }
    iniciarEspera(datos.linea, datos.paradero, datos.destino.nombre, datos.sentido);
    router.push("/viaje/espera");
  };

  const abrir = async (notificacion: Notificacion) => {
    if (!notificacion.leida) {
      // Se marca en pantalla sin esperar al repositorio
      setEstado((actual) =>
        actual.tipo === "ok"
          ? {
              ...actual,
              notificaciones: actual.notificaciones.map((n) => (n.id === notificacion.id ? { ...n, leida: true } : n)),
            }
          : actual,
      );
      marcarNotificacionLeida(notificacion.id)
        .then(actualizarNoLeidas)
        .catch(() => undefined);
    }

    try {
      switch (notificacion.tipo) {
        case "llegada":
          await abrirLlegada(notificacion);
          break;
        case "desvio":
          if (notificacion.lineaId) {
            router.push({ pathname: "/ruta/[id]", params: { id: notificacion.lineaId } });
          }
          break;
        case "transito":
        // TODO F3_06: la alerta de seguridad abrirá el mapa de seguridad (paso 4.4)
        case "seguridad":
          if (notificacion.paraderoId) {
            router.push({ pathname: "/paradero/[id]", params: { id: notificacion.paraderoId } });
          }
          break;
        case "logro":
          router.navigate("/perfil");
          break;
      }
    } catch {
      mostrar("No pudimos abrir el aviso. Inténtalo otra vez.");
    }
  };

  const { tipos, vacio } = FILTROS.find((f) => f.valor === filtro) ?? FILTROS[0];
  const secciones = estado.tipo === "ok" ? agrupar(estado.notificaciones.filter((n) => tipos.includes(n.tipo))) : [];

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <View style={[styles.barra, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={[typography.h1, styles.ink]} accessibilityRole="header">
          Alertas
        </Text>
        {/* TODO F3_05: ajustes */}
        <IconButton icon={<Settings />} accessibilityLabel="Ajustes" onPress={() => router.push("/ajustes")} />
      </View>

      <View style={styles.filtros}>
        {FILTROS.map(({ valor, label }) => (
          <Chip
            key={valor}
            label={label}
            state={filtro === valor ? "selected" : "default"}
            onPress={() => setFiltro(valor)}
          />
        ))}
      </View>

      {estado.tipo === "cargando" && (
        <View style={styles.estado}>
          <ActivityIndicator color={colors.ink} />
          <Text style={[typography.body, styles.muted, styles.centrado]}>Cargando alertas…</Text>
        </View>
      )}

      {estado.tipo === "error" && (
        <View style={styles.estado}>
          <Text style={[typography.body, styles.muted, styles.centrado]}>
            No pudimos cargar tus alertas. Revisa tu conexión e inténtalo otra vez.
          </Text>
          <Button label="Reintentar" variant="secondary" onPress={reintentar} />
        </View>
      )}

      {estado.tipo === "ok" && secciones.length === 0 && (
        <View style={styles.estado}>
          <Text style={[typography.body, styles.muted, styles.centrado]}>{vacio}</Text>
        </View>
      )}

      {secciones.length > 0 && (
        <ScrollView contentContainerStyle={styles.contenido}>
          {secciones.map(({ titulo, notificaciones }) => (
            <View key={titulo}>
              <Text style={[typography.overline, styles.muted, styles.seccion]}>{titulo}</Text>
              {notificaciones.map((notificacion) => {
                const Icono = ICONO[notificacion.tipo];
                const cuando =
                  titulo === "Anteriores" ? formatearDia(notificacion.fecha) : formatearHora(notificacion.fecha);
                return (
                  <ItemNotificacion
                    key={notificacion.id}
                    icon={<Icono />}
                    titulo={notificacion.titulo}
                    detalle={`${notificacion.detalle} · ${cuando}`}
                    leida={notificacion.leida}
                    tono={
                      notificacion.tipo === "llegada" || notificacion.tipo === "seguridad" ? notificacion.tipo : undefined
                    }
                    onPress={() => abrir(notificacion)}
                  />
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  barra: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  filtros: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  estado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  contenido: {
    paddingBottom: spacing.lg,
  },
  seccion: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
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
