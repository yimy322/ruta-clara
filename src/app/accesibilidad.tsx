import { useRouter } from "expo-router";
import { ALargeSmall, ArrowLeft, CirclePause, Contrast, Minus, Plus, Shapes, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, PildoraNivel, Toggle } from "@/components";
import { usePreferencias } from "@/context/PreferenciasContext";
import { useEstilos, useTema } from "@/context/TemaContext";
import { opacity, radii, sizes, spacing, type Tema } from "@/theme";

// Tamaño del texto: de 100 % a 200 % en pasos de 25 %
const ESCALA_MIN = 1;
const ESCALA_MAX = 2;
const PASO_ESCALA = 0.25;

// A1/A2 · Accesibilidad (4.8): tamaño del texto, alto contraste, reducir
// movimiento y señales sin depender del color. Se guardan en el dispositivo
// (PreferenciasContext) y se aplican en toda la app al instante.
export default function Accesibilidad() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const { ajustes, cambiarAjuste } = usePreferencias();

  const escala = ajustes.escalaTexto;
  const porcentaje = Math.round(escala * 100);
  const cambiarEscala = (delta: number) => {
    const nueva = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, escala + delta));
    if (nueva !== escala) {
      cambiarAjuste("escalaTexto", nueva);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <View style={[styles.barra, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton icon={<ArrowLeft />} accessibilityLabel="Volver" onPress={() => router.back()} />
        <Text style={[typography.h1, styles.ink, styles.flex]} accessibilityRole="header">
          Accesibilidad
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={[typography.body, styles.muted]}>
          Adapta RutaClara a lo que necesitas. Los cambios se aplican en toda la app y se guardan en tu cuenta.
        </Text>

        <Tarjeta
          Icono={ALargeSmall}
          activa={escala > ESCALA_MIN}
          titulo="Tamaño del texto"
          descripcion="Hasta 200 % sin perder contenido: las pantallas se reordenan y se desplazan."
        >
          <View style={styles.paso} accessibilityRole="adjustable" accessibilityLabel={`Tamaño del texto, ${porcentaje} %`}>
            <IconButton icon={<Minus />} accessibilityLabel="Reducir texto" onPress={() => cambiarEscala(-PASO_ESCALA)} />
            <Text style={[typography.h2, styles.ink]}>{porcentaje} %</Text>
            <IconButton icon={<Plus />} accessibilityLabel="Aumentar texto" onPress={() => cambiarEscala(PASO_ESCALA)} />
          </View>
          <View style={styles.vistaPrevia}>
            <Text style={[typography.overline, styles.muted]}>Vista previa</Text>
            <Text style={[typography.bodyStrong, styles.ink]}>La 50 llega en 4 min</Text>
          </View>
          {escala > ESCALA_MIN && (
            <Enlace texto="Ver ejemplo en Detalle de paradero" onPress={() => router.push("/paradero/puente-nuevo")} />
          )}
        </Tarjeta>

        <Tarjeta
          Icono={Contrast}
          activa={ajustes.altoContraste}
          titulo="Alto contraste"
          descripcion="Textos y bordes con contraste de 7:1. Ayuda a leer bajo el sol."
          valor={ajustes.altoContraste}
          onValueChange={(valor) => cambiarAjuste("altoContraste", valor)}
        >
          {ajustes.altoContraste && <Enlace texto="Ver ejemplo en Inicio" onPress={() => router.navigate("/")} />}
        </Tarjeta>

        <Tarjeta
          Icono={CirclePause}
          activa={ajustes.reducirMovimiento}
          titulo="Reducir movimiento"
          descripcion="Sin animaciones ni desplazamientos automáticos; los cambios de pantalla solo se desvanecen."
          valor={ajustes.reducirMovimiento}
          onValueChange={(valor) => cambiarAjuste("reducirMovimiento", valor)}
        />

        <Tarjeta
          Icono={Shapes}
          activa={ajustes.senalesSinColor}
          titulo="Señales sin depender del color"
          descripcion="Agrega íconos y patrones a los niveles del mapa de seguridad y a los estados."
          valor={ajustes.senalesSinColor}
          onValueChange={(valor) => cambiarAjuste("senalesSinColor", valor)}
        >
          {ajustes.senalesSinColor && (
            <View style={styles.leyenda} accessibilityLabel="Ejemplo de leyenda: alto, medio, sin reportes">
              <PildoraNivel nivel="alto" />
              <PildoraNivel nivel="medio" />
              <PildoraNivel nivel="sin" />
            </View>
          )}
        </Tarjeta>

        <Text style={[typography.caption, styles.muted]}>
          RutaClara también respeta el tamaño de texto y la reducción de movimiento configurados en tu celular.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Tarjeta de una opción: ícono (amarillo suave si está activa), título,
// descripción y, si tiene valor, un interruptor. Toda la cabecera alterna.
function Tarjeta({
  Icono,
  activa,
  titulo,
  descripcion,
  valor,
  onValueChange,
  children,
}: {
  Icono: LucideIcon;
  activa: boolean;
  titulo: string;
  descripcion: string;
  valor?: boolean;
  onValueChange?: (valor: boolean) => void;
  children?: ReactNode;
}) {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const interruptor = valor !== undefined && onValueChange;
  const cabecera = (
    <>
      <View style={[styles.icono, activa && styles.iconoActivo]}>
        <Icono color={colors.ink} size={sizes.settingsIcon} />
      </View>
      <View style={styles.texto}>
        <Text style={[typography.title, styles.ink]}>{titulo}</Text>
        <Text style={[typography.caption, styles.muted]}>{descripcion}</Text>
      </View>
      {interruptor && (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Toggle value={valor} onValueChange={onValueChange} />
        </View>
      )}
    </>
  );

  return (
    <View style={styles.tarjeta}>
      {interruptor ? (
        <Pressable
          onPress={() => onValueChange(!valor)}
          accessibilityRole="switch"
          accessibilityLabel={`${titulo}, ${descripcion}`}
          accessibilityState={{ checked: valor }}
          style={({ pressed }) => [styles.fila, pressed && styles.pressed]}
        >
          {cabecera}
        </Pressable>
      ) : (
        <View style={styles.fila}>{cabecera}</View>
      )}
      {children}
    </View>
  );
}

function Enlace({ texto, onPress }: { texto: string; onPress: () => void }) {
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);
  return (
    <Pressable onPress={onPress} accessibilityRole="link" hitSlop={spacing.md}>
      <Text style={[typography.captionStrong, styles.ink, styles.subrayado]}>{texto} →</Text>
    </Pressable>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    barra: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    contenido: {
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xl,
    },
    tarjeta: {
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: sizes.cardPadding,
      borderRadius: radii.control,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    fila: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    icono: {
      width: sizes.badge,
      height: sizes.badge,
      borderRadius: radii.badge,
      backgroundColor: colors.canvas,
      alignItems: "center",
      justifyContent: "center",
    },
    iconoActivo: {
      backgroundColor: colors.yellowSoft,
    },
    texto: {
      flex: 1,
      gap: spacing.xxs,
    },
    paso: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    vistaPrevia: {
      gap: spacing.xxs,
      paddingHorizontal: spacing.md,
      paddingVertical: sizes.legendPadding,
      borderRadius: radii.badge,
      backgroundColor: colors.canvas,
    },
    leyenda: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    subrayado: {
      textDecorationLine: "underline",
    },
    flex: {
      flex: 1,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
    pressed: {
      opacity: opacity.pressed,
    },
  });
