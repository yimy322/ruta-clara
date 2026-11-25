import { useRouter, type Href } from "expo-router";
import {
  CircleAlert,
  CircleHelp,
  CircleUser,
  Download,
  Power,
  Settings,
  Star,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useEstilos, useTema } from "@/context/TemaContext";
import { getUsuario } from "@/data/repositorio";
import { useCerrarSesion } from "@/hooks/useCerrarSesion";
import { borderWidths, opacity, radii, sizes, spacing, type Tema } from "@/theme";
import type { Usuario } from "@/types";
import { formatearPuntos } from "@/utils/formato";
import { calcularRango } from "@/utils/gamificacion";
import { abrirWhatsApp } from "@/utils/soporte";

import { Avatar } from "./Avatar";
import { Chip } from "./Chip";
import { IconButton } from "./IconButton";
import { useToast } from "./Toast";

type MenuLateralProps = {
  visible: boolean;
  onCerrar: () => void;
};

type Item = {
  titulo: string;
  subtitulo?: string;
  Icono: LucideIcon;
  // Estrella rellena (Comunidad y Puntos)
  relleno?: boolean;
  tono?: "seguridad";
} & ({ ruta: Href } | { accion: "offline" | "soporte" });

// Ítems de F3_07, en el orden de Figma
const ITEMS: Item[] = [
  { titulo: "Mi Perfil", Icono: CircleUser, ruta: "/perfil" },
  { titulo: "Favoritos", Icono: Star, ruta: "/favoritos" },
  {
    titulo: "Modo offline",
    subtitulo: "Mapas descargados · Lima Este 42 MB", // supuesto: dato de ejemplo de Figma
    Icono: Download,
    accion: "offline",
  },
  { titulo: "Comunidad y Puntos", Icono: Star, relleno: true, ruta: "/perfil" },
  { titulo: "Mapa de seguridad", Icono: CircleAlert, tono: "seguridad", ruta: "/seguridad" },
  { titulo: "Ajustes", Icono: Settings, ruta: "/ajustes" },
  { titulo: "Soporte", Icono: CircleHelp, accion: "soporte" },
];

const DURACION_MS = 220;
// Arrastre hacia la izquierda (en pt o velocidad) a partir del cual se cierra
const UMBRAL_CIERRE = sizes.drawerWidth / 3;
const VELOCIDAD_CIERRE = 0.5;

// Menú lateral (F3_07): entra desde la izquierda sobre Inicio. Se cierra al
// tocar fuera, al deslizarlo a la izquierda, con «Atrás» de Android o con la X.
// Con «reducir movimiento» aparece con un fundido en vez de deslizarse.
export function MenuLateral({ visible, onCerrar }: MenuLateralProps) {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mostrar } = useToast();
  const cerrarSesion = useCerrarSesion();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [reducirMovimiento, setReducirMovimiento] = useState(false);
  const [desplazamiento] = useState(() => new Animated.Value(-sizes.drawerWidth));
  const [visibilidad] = useState(() => new Animated.Value(0));

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducirMovimiento);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducirMovimiento);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (visible && !usuario) {
      getUsuario()
        .then(setUsuario)
        .catch(() => {});
    }
  }, [visible, usuario]);

  // Entrada: desde la izquierda, o solo fundido con «reducir movimiento»
  useEffect(() => {
    if (!visible) return;
    desplazamiento.setValue(reducirMovimiento ? 0 : -sizes.drawerWidth);
    visibilidad.setValue(0);
    Animated.parallel([
      Animated.timing(visibilidad, { toValue: 1, duration: DURACION_MS, useNativeDriver: true }),
      Animated.timing(desplazamiento, { toValue: 0, duration: DURACION_MS, useNativeDriver: true }),
    ]).start();
  }, [visible, reducirMovimiento, desplazamiento, visibilidad]);

  // Salida animada; al terminar se avisa al padre (que oculta el Modal) y se
  // hace la acción elegida, p. ej. navegar
  const cerrarY = useCallback(
    (accion?: () => void) => {
      Animated.parallel([
        Animated.timing(visibilidad, { toValue: 0, duration: DURACION_MS, useNativeDriver: true }),
        Animated.timing(desplazamiento, {
          toValue: reducirMovimiento ? 0 : -sizes.drawerWidth,
          duration: DURACION_MS,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onCerrar();
        accion?.();
      });
    },
    [visibilidad, desplazamiento, reducirMovimiento, onCerrar],
  );

  // Deslizar el panel hacia la izquierda lo cierra
  const arrastre = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dx < -spacing.sm && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: (_, g) => desplazamiento.setValue(Math.min(0, g.dx)),
        onPanResponderRelease: (_, g) => {
          if (g.dx < -UMBRAL_CIERRE || g.vx < -VELOCIDAD_CIERRE) {
            cerrarY();
          } else {
            Animated.spring(desplazamiento, { toValue: 0, useNativeDriver: true }).start();
          }
        },
      }),
    [cerrarY, desplazamiento],
  );

  const elegir = (item: Item) => {
    if ("ruta" in item) {
      cerrarY(() => router.navigate(item.ruta));
      return;
    }
    if (item.accion === "offline") {
      // TODO Fase 5: descarga de mapas y cola sin conexión
      cerrarY(() => mostrar("Modo offline disponible pronto"));
      return;
    }
    cerrarY(async () => {
      if (!(await abrirWhatsApp())) {
        mostrar("No se pudo abrir WhatsApp");
      }
    });
  };

  const rango = usuario ? calcularRango(usuario.puntos).actual : null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={() => cerrarY()}>
      <Animated.View style={[styles.scrim, { opacity: visibilidad }]} />
      <View style={styles.fila}>
        <Animated.View
          {...arrastre.panHandlers}
          accessibilityViewIsModal
          style={[
            styles.panel,
            { paddingTop: insets.top, paddingBottom: insets.bottom, transform: [{ translateX: desplazamiento }] },
            reducirMovimiento && { opacity: visibilidad },
          ]}
        >
          <ScrollView contentContainerStyle={styles.contenido} bounces={false}>
            <View style={styles.perfil}>
              <View style={styles.perfilArriba}>
                <Avatar fuente={usuario?.avatar} tamano={sizes.avatarMedium} />
                <IconButton icon={<X />} accessibilityLabel="Cerrar menú" onPress={() => cerrarY()} />
              </View>
              {usuario && rango ? (
                <>
                  <Text style={[typography.h2, styles.ink]} accessibilityRole="header" numberOfLines={1}>
                    {usuario.nombre}
                  </Text>
                  <View style={styles.chips}>
                    <Chip label={rango.nombre} state="live" />
                    <Chip label={`${formatearPuntos(usuario.puntos)} pts`} />
                  </View>
                </>
              ) : (
                <ActivityIndicator color={colors.ink} style={styles.cargando} />
              )}
            </View>

            {ITEMS.map((item) => (
              <Pressable
                key={item.titulo}
                onPress={() => elegir(item)}
                accessibilityRole="button"
                accessibilityLabel={item.subtitulo ? `${item.titulo}, ${item.subtitulo}` : item.titulo}
                style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              >
                <View style={[styles.icono, item.tono === "seguridad" && styles.iconoSeguridad]}>
                  <item.Icono
                    color={colors.ink}
                    fill={item.relleno ? colors.ink : "none"}
                    size={sizes.iconGlyph}
                  />
                </View>
                <View style={styles.texto}>
                  <Text style={[typography.bodyStrong, styles.ink]}>{item.titulo}</Text>
                  {item.subtitulo != null && (
                    <Text style={[typography.caption, styles.muted]}>{item.subtitulo}</Text>
                  )}
                </View>
              </Pressable>
            ))}

            <View style={styles.espacio} />

            <Pressable
              onPress={() => cerrarY(cerrarSesion)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.salir, pressed && styles.pressed]}
            >
              <Power color={colors.red} size={sizes.chipIcon} />
              <Text style={[typography.bodyStrong, styles.red]}>Cerrar sesión</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>

        {/* Franja derecha (F3_07 «Tap fuera»): toca para cerrar */}
        <Pressable
          style={styles.fuera}
          onPress={() => cerrarY()}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
        />
      </View>
    </Modal>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    scrim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.scrim,
    },
    fila: {
      flex: 1,
      flexDirection: "row",
    },
    panel: {
      width: sizes.drawerWidth,
      backgroundColor: colors.surface,
      borderRightWidth: borderWidths.regular,
      borderRightColor: colors.ink,
    },
    contenido: {
      flexGrow: 1,
    },
    perfil: {
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
      borderBottomWidth: borderWidths.regular,
      borderBottomColor: colors.ink,
    },
    perfilArriba: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    cargando: {
      alignSelf: "flex-start",
      marginVertical: spacing.lg,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      minHeight: sizes.menuRowHeight,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderBottomWidth: borderWidths.thin,
      borderBottomColor: colors.line,
    },
    // Mismo aspecto que IconButton, pero sin ser otro botón dentro de la fila
    icono: {
      width: sizes.iconButton,
      height: sizes.iconButton,
      borderRadius: radii.pill,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      ...shadows.card,
    },
    iconoSeguridad: {
      borderWidth: borderWidths.regular,
      borderColor: colors.red,
    },
    texto: {
      flex: 1,
      gap: spacing.xxs,
    },
    espacio: {
      flex: 1,
      minHeight: spacing.xl,
    },
    salir: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      minHeight: sizes.minTouchRow,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
    },
    fuera: {
      flex: 1,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
    red: {
      color: colors.red,
    },
    pressed: {
      opacity: opacity.pressed,
    },
  });
