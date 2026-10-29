import { useFocusEffect, useRouter } from "expo-router";
import { Bell, Check, Pencil, Plus, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Chip, IconButton, ListItem, useToast } from "@/components";
import {
  alternarFavorita,
  alternarParaderoFavorito,
  eliminarAlerta,
  getFavoritos,
  getParaderoCercano,
  getUbicacionUsuario,
} from "@/data/repositorio";
import { colors, spacing, typography } from "@/theme";
import type { Favoritos as DatosFavoritos, ParaderoFavorito, RutaGuardada } from "@/types";
import { etiquetaOcupacion, formatoDias, formatoHora, textoRutaAlerta } from "@/utils/formato";
import { ICONO_LUGAR } from "@/utils/icons";

type Filtro = "todos" | "lugares" | "paraderos" | "rutas";

const FILTROS: { valor: Filtro; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "lugares", label: "Lugares" },
  { valor: "paraderos", label: "Paraderos" },
  { valor: "rutas", label: "Rutas" },
];

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "ok"; datos: DatosFavoritos };

// "La 50 en 4 min · Lleno"; sin reportes, "Sin datos recientes · 3 líneas"
function subtituloParadero({ proxima, lineas }: ParaderoFavorito) {
  if (!proxima) {
    return `Sin datos recientes · ${lineas} ${lineas === 1 ? "línea" : "líneas"}`;
  }
  const llegada = `${proxima.linea.nombre} en ${proxima.minutos} min`;
  return proxima.ocupacion ? `${llegada} · ${etiquetaOcupacion(proxima.ocupacion)}` : llegada;
}

function subtituloRuta(ruta: RutaGuardada) {
  if (ruta.tipo === "linea") {
    return "Sin alerta";
  }
  const { activa, dias, hora, minuto } = ruta.alerta;
  return activa ? `Alerta ${formatoDias(dias)} ${formatoHora(hora, minuto)}` : "Alerta pausada";
}

const tituloRuta = (ruta: RutaGuardada) =>
  ruta.tipo === "alerta" ? textoRutaAlerta(ruta.linea, ruta.paradero, ruta.destino) : ruta.linea.nombre;

// F3_01 · Favoritos
export default function Favoritos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mostrar } = useToast();

  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [editando, setEditando] = useState(false);
  // Evita dos toques seguidos mientras responde el repositorio
  const [guardando, setGuardando] = useState(false);

  // Devuelve la limpieza que descarta una respuesta que llega tarde
  const cargar = useCallback(() => {
    let activo = true;
    getFavoritos()
      .then((datos) => activo && setEstado({ tipo: "ok", datos }))
      // Si ya se mostraban los favoritos, se conserva lo anterior
      .catch(() => activo && setEstado((actual) => (actual.tipo === "ok" ? actual : { tipo: "error" })));
    return () => {
      activo = false;
    };
  }, []);

  // Al volver de un paradero, una ruta o una alerta se recarga sin mostrar
  // de nuevo el estado de carga, para reflejar lo que cambió
  useFocusEffect(cargar);

  const reintentar = () => {
    setEstado({ tipo: "cargando" });
    cargar();
  };

  // Ejecuta el cambio y recarga; si falla, avisa sin perder la lista
  const quitar = async (accion: () => Promise<unknown>, mensaje: string) => {
    if (guardando) {
      return;
    }
    setGuardando(true);
    try {
      await accion();
      mostrar(mensaje);
      cargar();
    } catch {
      mostrar("No se pudo quitar. Inténtalo otra vez.");
    } finally {
      setGuardando(false);
    }
  };

  const quitarParadero = ({ paradero }: ParaderoFavorito) =>
    quitar(() => alternarParaderoFavorito(paradero.id), "Quitado de Favoritos");

  const quitarRuta = (ruta: RutaGuardada) => {
    if (ruta.tipo === "linea") {
      quitar(() => alternarFavorita(ruta.linea.id), "Quitado de Favoritos");
      return;
    }
    Alert.alert("¿Eliminar la alerta?", `Dejarás de recibir avisos de ${tituloRuta(ruta)}.`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => quitar(() => eliminarAlerta(ruta.alerta.id), "Alerta eliminada") },
    ]);
  };

  const abrirAlertaParadero = ({ paradero, alerta }: ParaderoFavorito) =>
    router.push(
      alerta ? { pathname: "/alerta", params: { id: alerta.id } } : { pathname: "/alerta", params: { paraderoId: paradero.id } },
    );

  const abrirRuta = (ruta: RutaGuardada) =>
    router.push(
      ruta.tipo === "alerta"
        ? { pathname: "/alerta", params: { id: ruta.alerta.id } }
        : { pathname: "/ruta/[id]", params: { id: ruta.linea.id } },
    );

  const abrirParaderoCercano = async () => {
    try {
      const { lat, lng } = await getUbicacionUsuario();
      const paradero = await getParaderoCercano(lat, lng);
      if (paradero) {
        router.push({ pathname: "/paradero/[id]", params: { id: paradero.id } });
      } else {
        mostrar("No encontramos paraderos cerca");
      }
    } catch {
      mostrar("No pudimos encontrar tu paradero cercano");
    }
  };

  const anadir = () =>
    Alert.alert("Añadir favorito", "Marca un paradero con ★ o busca una ruta para guardarla.", [
      { text: "Paradero cercano", onPress: abrirParaderoCercano },
      { text: "Buscar una ruta", onPress: () => router.push("/buscar") },
      { text: "Cancelar", style: "cancel" },
    ]);

  const ver = (seccion: Exclude<Filtro, "todos">) => filtro === "todos" || filtro === seccion;

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <View style={[styles.barra, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={[typography.h1, styles.ink]} accessibilityRole="header">
          Favoritos
        </Text>
        {estado.tipo === "ok" && (
          <IconButton
            icon={editando ? <Check /> : <Pencil />}
            active={editando}
            accessibilityLabel={editando ? "Terminar edición" : "Editar favoritos"}
            onPress={() => setEditando((actual) => !actual)}
          />
        )}
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
          <Text style={[typography.body, styles.muted, styles.centrado]}>Cargando favoritos…</Text>
        </View>
      )}

      {estado.tipo === "error" && (
        <View style={styles.estado}>
          <Text style={[typography.body, styles.muted, styles.centrado]}>
            No pudimos cargar tus favoritos. Revisa tu conexión e inténtalo otra vez.
          </Text>
          <Button label="Reintentar" variant="secondary" onPress={reintentar} />
        </View>
      )}

      {estado.tipo === "ok" && (
        <ScrollView contentContainerStyle={styles.contenido}>
          {ver("lugares") && (
            <>
              <Text style={[typography.overline, styles.muted, styles.seccion]}>Lugares</Text>
              {estado.datos.lugares.length === 0 ? (
                <Text style={[typography.body, styles.muted, styles.vacio]}>Aún no tienes lugares guardados</Text>
              ) : (
                estado.datos.lugares.map((lugar) => {
                  const Icono = ICONO_LUGAR[lugar.nombre];
                  return (
                    <ListItem
                      key={lugar.id}
                      title={lugar.nombre}
                      badge={<Icono />}
                      trailing="›"
                      onPress={() => router.push({ pathname: "/rutas", params: { destino: lugar.nombre } })}
                    />
                  );
                })
              )}
            </>
          )}

          {ver("paraderos") && (
            <>
              <Text style={[typography.overline, styles.muted, styles.seccion]}>Paraderos frecuentes</Text>
              {estado.datos.paraderos.length === 0 ? (
                <Text style={[typography.body, styles.muted, styles.vacio]}>
                  Marca un paradero con ★ para verlo aquí
                </Text>
              ) : (
                estado.datos.paraderos.map((favorito) => (
                  <ListItem
                    key={favorito.paradero.id}
                    title={favorito.paradero.nombre}
                    subtitle={subtituloParadero(favorito)}
                    badge="P"
                    onPress={() => router.push({ pathname: "/paradero/[id]", params: { id: favorito.paradero.id } })}
                    trailing={
                      editando ? (
                        <IconButton
                          icon={<X />}
                          accessibilityLabel={`Quitar ${favorito.paradero.nombre} de favoritos`}
                          onPress={() => quitarParadero(favorito)}
                        />
                      ) : (
                        <IconButton
                          icon={<Bell />}
                          active={favorito.alerta?.activa ?? false}
                          accessibilityLabel={
                            favorito.alerta
                              ? `Editar alerta de ${favorito.paradero.nombre}`
                              : `Crear alerta en ${favorito.paradero.nombre}`
                          }
                          onPress={() => abrirAlertaParadero(favorito)}
                        />
                      )
                    }
                  />
                ))
              )}
            </>
          )}

          {ver("rutas") && (
            <>
              <Text style={[typography.overline, styles.muted, styles.seccion]}>Rutas guardadas</Text>
              {estado.datos.rutas.length === 0 ? (
                <Text style={[typography.body, styles.muted, styles.vacio]}>
                  Marca una línea con ★ o crea una alerta para verla aquí
                </Text>
              ) : (
                estado.datos.rutas.map((ruta) => (
                  <ListItem
                    key={ruta.tipo === "alerta" ? ruta.alerta.id : ruta.linea.id}
                    title={tituloRuta(ruta)}
                    subtitle={subtituloRuta(ruta)}
                    badge={ruta.linea.codigo}
                    onPress={() => abrirRuta(ruta)}
                    trailing={
                      editando ? (
                        <IconButton
                          icon={<X />}
                          accessibilityLabel={
                            ruta.tipo === "alerta" ? `Eliminar alerta de ${tituloRuta(ruta)}` : `Quitar ${ruta.linea.nombre} de favoritos`
                          }
                          onPress={() => quitarRuta(ruta)}
                        />
                      ) : (
                        "›"
                      )
                    }
                  />
                ))
              )}
            </>
          )}

          <View style={styles.anadir}>
            <Button label="Añadir favorito" variant="secondary" icon={<Plus />} onPress={anadir} />
          </View>
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
  vacio: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  anadir: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
