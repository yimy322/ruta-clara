import { useState } from "react";
import { StyleSheet, Text, View, type Insets, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";

import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
import type { Coordenada, Linea, Paradero } from "@/types";

import { Chip } from "./Chip";

type UnidadMapa = {
  linea: Linea;
  lat: number;
  lng: number;
};

type MapaProps = {
  usuario?: Coordenada;
  paraderos?: Paradero[];
  unidades?: UnidadMapa[];
  // Une los paraderos en el orden recibido con una línea (recorrido de la ruta)
  recorrido?: boolean;
  // Rótulo en la esquina superior izquierda (p. ej. "Recorrido Ate → Surco")
  etiqueta?: string;
  // Espacio tapado por controles flotantes: los puntos se acomodan fuera de él
  margen?: Insets;
  estilo?: StyleProp<ViewStyle>;
};

// Separación mínima entre los puntos y el borde del área visible; a los
// lados es mayor porque los chips de unidades son anchos
const BORDE_X = spacing.xxl * 2;
const BORDE_Y = spacing.xxl;
// Lado mínimo de la caja en grados (~550 m), para que un solo punto no llene el mapa
const SPAN_MINIMO = 0.005;

// Calles decorativas, en fracción del ancho/alto (posiciones del wireframe F1_04)
const CALLES_HORIZONTALES = [0.3, 0.64];
const CALLES_VERTICALES = [0.33, 0.72];

// Mapa PROVISIONAL que imita los wireframes: fondo plano, calles fijas y los
// puntos ubicados con una proyección simple que encuadra todo lo recibido.
// Fase 6: se reemplaza por un mapa real con las mismas props.
export function Mapa({
  usuario,
  paraderos = [],
  unidades = [],
  recorrido = false,
  etiqueta,
  margen,
  estilo,
}: MapaProps) {
  const [tamano, setTamano] = useState({ ancho: 0, alto: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setTamano({ ancho: width, alto: height });
  };

  const puntos: Coordenada[] = [...(usuario ? [usuario] : []), ...paraderos, ...unidades];
  const proyectar = crearProyeccion(puntos, usuario, tamano.ancho, tamano.alto, margen);

  return (
    <View style={[styles.base, estilo]} onLayout={handleLayout} accessibilityLabel="Mapa">
      {CALLES_HORIZONTALES.map((y) => (
        <View key={`h${y}`} style={[styles.calle, styles.calleHorizontal, { top: `${y * 100}%` }]} />
      ))}
      {CALLES_VERTICALES.map((x) => (
        <View key={`v${x}`} style={[styles.calle, styles.calleVertical, { left: `${x * 100}%` }]} />
      ))}

      {proyectar &&
        recorrido &&
        paraderos.slice(1).map((paradero, i) => (
          <View key={`r${paraderos[i].id}`} style={[styles.tramo, estiloTramo(proyectar(paraderos[i]), proyectar(paradero))]} />
        ))}

      {proyectar &&
        paraderos.map((paradero) => (
          <View
            key={paradero.id}
            style={[styles.marcador, styles.paradero, proyectar(paradero)]}
            accessibilityLabel={paradero.nombre}
          >
            <View style={styles.paraderoCentro} />
          </View>
        ))}

      {proyectar && usuario && (
        <View style={[styles.marcador, styles.halo, proyectar(usuario)]} accessibilityLabel="Tu ubicación">
          <View style={styles.usuario} />
        </View>
      )}

      {proyectar &&
        unidades.map((unidad) => (
          <View key={unidad.linea.id} style={[styles.marcador, styles.unidad, proyectar(unidad)]}>
            <Chip label={unidad.linea.nombre} state="live" />
          </View>
        ))}

      {etiqueta != null && (
        <View style={styles.etiqueta}>
          <Text style={[typography.overline, styles.etiquetaTexto]} numberOfLines={1}>
            {etiqueta}
          </Text>
        </View>
      )}
    </View>
  );
}

type Punto = { left: number; top: number };

// Segmento recto entre dos puntos: una barra centrada en el punto medio,
// del largo de la distancia y girada según el ángulo entre ambos
function estiloTramo(a: Punto, b: Punto): ViewStyle {
  const dx = b.left - a.left;
  const dy = b.top - a.top;
  return {
    left: (a.left + b.left) / 2,
    top: (a.top + b.top) / 2,
    width: Math.hypot(dx, dy),
    transform: [{ translateX: "-50%" }, { translateY: "-50%" }, { rotate: `${Math.atan2(dy, dx)}rad` }],
  };
}

// Devuelve una función lat/lng → posición (left/top) dentro del recuadro, o
// null si todavía no se conoce el tamaño o no hay puntos. Usa la misma escala
// en ambos ejes (la longitud se corrige por cos(lat)). Centra en el usuario si
// lo hay (como un mapa real); si no, en el centro de los puntos.
function crearProyeccion(
  puntos: Coordenada[],
  centro: Coordenada | undefined,
  ancho: number,
  alto: number,
  margen: Insets = {},
) {
  if (puntos.length === 0 || ancho === 0 || alto === 0) {
    return null;
  }

  const latMedia = puntos.reduce((suma, p) => suma + p.lat, 0) / puntos.length;
  const cosLat = Math.cos((latMedia * Math.PI) / 180);
  const xs = puntos.map((p) => p.lng * cosLat);
  const ys = puntos.map((p) => -p.lat);

  const centroX = centro ? centro.lng * cosLat : (Math.min(...xs) + Math.max(...xs)) / 2;
  const centroY = centro ? -centro.lat : (Math.min(...ys) + Math.max(...ys)) / 2;
  // Doble de la distancia al punto más lejano, para que todos entren alrededor del centro
  const spanX = Math.max(2 * Math.max(...xs.map((x) => Math.abs(x - centroX))), SPAN_MINIMO);
  const spanY = Math.max(2 * Math.max(...ys.map((y) => Math.abs(y - centroY))), SPAN_MINIMO);

  const izquierda = (margen.left ?? 0) + BORDE_X;
  const arriba = (margen.top ?? 0) + BORDE_Y;
  const anchoUtil = Math.max(ancho - izquierda - (margen.right ?? 0) - BORDE_X, 1);
  const altoUtil = Math.max(alto - arriba - (margen.bottom ?? 0) - BORDE_Y, 1);
  const escala = Math.min(anchoUtil / spanX, altoUtil / spanY);

  return (punto: Coordenada) => ({
    left: izquierda + anchoUtil / 2 + (punto.lng * cosLat - centroX) * escala,
    top: arriba + altoUtil / 2 + (-punto.lat - centroY) * escala,
  });
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.map,
    overflow: "hidden",
  },
  calle: {
    position: "absolute",
    backgroundColor: colors.surface,
  },
  calleHorizontal: {
    left: 0,
    right: 0,
    height: sizes.mapRoad,
  },
  calleVertical: {
    top: 0,
    bottom: 0,
    width: sizes.mapRoad,
  },
  // Cada marcador se centra sobre su coordenada
  marcador: {
    position: "absolute",
    transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
  },
  paradero: {
    width: sizes.mapStop,
    height: sizes.mapStop,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  paraderoCentro: {
    width: sizes.mapStop / 2,
    height: sizes.mapStop / 2,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
  },
  halo: {
    width: sizes.mapUserHalo,
    height: sizes.mapUserHalo,
    borderRadius: radii.pill,
    backgroundColor: colors.blueHalo,
    alignItems: "center",
    justifyContent: "center",
  },
  usuario: {
    width: sizes.mapUser,
    height: sizes.mapUser,
    borderRadius: radii.pill,
    backgroundColor: colors.blue,
    borderWidth: borderWidths.regular,
    borderColor: colors.surface,
  },
  unidad: {
    alignItems: "center",
  },
  tramo: {
    position: "absolute",
    height: sizes.mapRoute,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
  },
  etiqueta: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: sizes.mapLabelPaddingX,
    paddingVertical: sizes.mapLabelPaddingY,
    borderRadius: radii.xs,
    borderWidth: borderWidths.thin,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  etiquetaTexto: {
    color: colors.inkMuted,
  },
});
