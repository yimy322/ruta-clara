import { Bus } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { StyleSheet, Text, View, type Insets, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";

import { borderWidths, colors, opacity, radii, shadows, sizes, spacing, typography } from "@/theme";
import type { Coordenada, Linea, NivelZona, Paradero } from "@/types";

import { Chip } from "./Chip";

type UnidadMapa = {
  linea: Linea;
  lat: number;
  lng: number;
  // Texto del chip; por defecto el nombre de la línea
  etiqueta?: string;
  icono?: ReactNode;
};

// Mancha de calor del mapa de seguridad (F3_06)
type ZonaMapa = {
  id: string;
  lat: number;
  lng: number;
  nivel: NivelZona;
};

// Diámetro y color de cada nivel (manchas de F3_06)
const ZONA: Record<NivelZona, { diametro: number; color: string; texto: string }> = {
  alto: { diametro: sizes.zonaAlta, color: colors.red, texto: "Zona de riesgo alto" },
  medio: { diametro: sizes.zonaMedia, color: colors.amber, texto: "Zona de riesgo medio" },
};

type MapaProps = {
  usuario?: Coordenada;
  paraderos?: Paradero[];
  unidades?: UnidadMapa[];
  // Une los paraderos en el orden recibido con una línea (recorrido de la ruta)
  recorrido?: boolean;
  // Rótulo en la esquina superior izquierda (p. ej. "Recorrido Ate → Surco")
  etiqueta?: string;
  // Rótulo bajo el punto del usuario (p. ej. "Tú · paradero")
  etiquetaUsuario?: string;
  // Une cada unidad con el usuario con una línea punteada (unidad en camino, F1_08)
  seguimiento?: boolean;
  // "P": paradero como cuadro negro con una P (Inicio, F1_04). Por defecto, punto
  marcadorParadero?: "punto" | "P";
  // "burbuja": unidad en vivo como píldora amarilla con ícono de bus (F1_04).
  // Por defecto, Chip Live
  estiloUnidad?: "chip" | "burbuja";
  // Manchas de calor de seguridad, debajo de los demás puntos (F3_06)
  zonas?: ZonaMapa[];
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

// Calles decorativas, en fracción del ancho/alto (posiciones de F1_04)
const CALLES_HORIZONTALES = [0.3, 0.64];
const CALLES_VERTICALES = [0.33, 0.72];

// Manzanas y parque decorativos (alta fidelidad, F1_04), en fracción del
// ancho/alto del frame de 360 × 740: [left, top, width, height]
const MANZANAS: [number, number, number, number][] = [
  [0.39, 0.054, 0.278, 0.216],
  [0.044, 0.338, 0.256, 0.149],
  [0.778, 0.338, 0.178, 0.176],
  [0.044, 0.676, 0.256, 0.203],
];
const PARQUE: [number, number, number, number] = [0.394, 0.405, 0.294, 0.162];
// Avenida diagonal: centro en fracción y giro (F1_04)
const AVENIDA = { top: 0.65, angulo: "-22deg" } as const;
// Bajo este alto el mapa es una miniatura: sin avenida, para no tapar el recorrido
const ALTO_MINIMO_AVENIDA = 300;

const fraccion = ([left, top, width, height]: [number, number, number, number]): ViewStyle => ({
  left: `${left * 100}%`,
  top: `${top * 100}%`,
  width: `${width * 100}%`,
  height: `${height * 100}%`,
});

// Mapa PROVISIONAL que imita los wireframes: fondo plano, calles fijas y los
// puntos ubicados con una proyección simple que encuadra todo lo recibido.
// Fase 6: se reemplaza por un mapa real con las mismas props.
export function Mapa({
  usuario,
  paraderos = [],
  unidades = [],
  recorrido = false,
  etiqueta,
  etiquetaUsuario,
  seguimiento = false,
  marcadorParadero = "punto",
  estiloUnidad = "chip",
  zonas = [],
  margen,
  estilo,
}: MapaProps) {
  const [tamano, setTamano] = useState({ ancho: 0, alto: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setTamano({ ancho: width, alto: height });
  };

  const puntos: Coordenada[] = [...(usuario ? [usuario] : []), ...paraderos, ...unidades, ...zonas];
  const proyectar = crearProyeccion(puntos, usuario, tamano.ancho, tamano.alto, margen);

  return (
    <View style={[styles.base, estilo]} onLayout={handleLayout} accessibilityLabel="Mapa">
      {MANZANAS.map((m) => (
        <View key={`m${m.join()}`} style={[styles.manzana, fraccion(m)]} />
      ))}
      <View style={[styles.parque, fraccion(PARQUE)]} />
      {tamano.alto >= ALTO_MINIMO_AVENIDA && <View style={styles.avenida} />}
      {CALLES_HORIZONTALES.map((y) => (
        <View key={`h${y}`} style={[styles.calle, styles.calleHorizontal, { top: `${y * 100}%` }]} />
      ))}
      {CALLES_VERTICALES.map((x) => (
        <View key={`v${x}`} style={[styles.calle, styles.calleVertical, { left: `${x * 100}%` }]} />
      ))}

      {proyectar &&
        zonas.map((zona) => {
          const { diametro, color, texto } = ZONA[zona.nivel];
          const radio = diametro / 2;
          return (
            <View
              key={`z${zona.id}`}
              style={[styles.marcador, { width: diametro, height: diametro }, proyectar(zona)]}
              accessibilityLabel={texto}
              pointerEvents="none"
            >
              <Svg width={diametro} height={diametro}>
                <Defs>
                  <RadialGradient id={`g${zona.id}`} cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor={color} stopOpacity={opacity.zonaCentro} />
                    <Stop offset="1" stopColor={color} stopOpacity={0} />
                  </RadialGradient>
                </Defs>
                <Circle cx={radio} cy={radio} r={radio} fill={`url(#g${zona.id})`} />
              </Svg>
            </View>
          );
        })}

      {proyectar &&
        recorrido &&
        paraderos.slice(1).map((paradero, i) => (
          <View key={`r${paraderos[i].id}`} style={[styles.tramo, estiloTramo(proyectar(paraderos[i]), proyectar(paradero))]} />
        ))}

      {proyectar &&
        usuario &&
        seguimiento &&
        unidades.flatMap((unidad) =>
          trazosPunteados(proyectar(unidad), proyectar(usuario)).map(([a, b], i) => (
            <View key={`s${unidad.linea.id}-${i}`} style={[styles.tramo, estiloTramo(a, b)]} />
          )),
        )}

      {proyectar &&
        paraderos.map((paradero) => (
          <View
            key={paradero.id}
            style={[styles.marcador, marcadorParadero === "P" ? styles.paraderoP : styles.paradero, proyectar(paradero)]}
            accessibilityLabel={paradero.nombre}
          >
            {marcadorParadero === "P" ? (
              <Text style={[typography.captionStrong, styles.paraderoLetra]}>P</Text>
            ) : (
              <View style={styles.paraderoCentro} />
            )}
          </View>
        ))}

      {proyectar && usuario && (
        <View style={[styles.marcador, styles.halo, proyectar(usuario)]} accessibilityLabel="Tu ubicación">
          <View style={styles.usuario} />
        </View>
      )}

      {proyectar && usuario && etiquetaUsuario != null && (
        <View style={[styles.marcador, styles.etiquetaUsuario, proyectar(usuario)]}>
          <Text style={[typography.caption, styles.etiquetaTexto]} numberOfLines={1}>
            {etiquetaUsuario}
          </Text>
        </View>
      )}

      {proyectar &&
        unidades.map((unidad) => (
          <View key={unidad.linea.id} style={[styles.marcador, styles.unidad, proyectar(unidad)]}>
            {estiloUnidad === "burbuja" ? (
              <View style={styles.burbuja} accessibilityLabel={`Unidad en vivo: ${unidad.etiqueta ?? unidad.linea.nombre}`}>
                <View style={styles.burbujaIcono}>
                  {/* supuesto: Figma no deja ver el color del ícono; amarillo sobre el círculo negro */}
                  <Bus color={colors.yellow} size={sizes.mapBusGlyph} />
                </View>
                <Text style={[typography.captionStrong, styles.ink]} numberOfLines={1}>
                  {unidad.etiqueta ?? unidad.linea.nombre}
                </Text>
              </View>
            ) : (
              <Chip label={unidad.etiqueta ?? unidad.linea.nombre} icon={unidad.icono} state="live" />
            )}
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

// Divide el segmento a→b en trazos de `sizes.mapDash` separados por huecos
// del mismo largo (línea punteada)
function trazosPunteados(a: Punto, b: Punto): [Punto, Punto][] {
  const largo = Math.hypot(b.left - a.left, b.top - a.top);
  const cantidad = Math.floor(largo / (sizes.mapDash * 2));
  const enPunto = (distancia: number): Punto => ({
    left: a.left + ((b.left - a.left) * distancia) / largo,
    top: a.top + ((b.top - a.top) * distancia) / largo,
  });
  return Array.from({ length: cantidad }, (_, i) => [
    enPunto(i * sizes.mapDash * 2),
    enPunto(i * sizes.mapDash * 2 + sizes.mapDash),
  ]);
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
  manzana: {
    position: "absolute",
    borderRadius: radii.md,
    backgroundColor: colors.block,
  },
  parque: {
    position: "absolute",
    borderRadius: radii.control,
    backgroundColor: colors.park,
  },
  // Más ancha que el mapa para que el giro no deje puntas visibles
  avenida: {
    position: "absolute",
    left: "-25%",
    right: "-25%",
    top: `${AVENIDA.top * 100}%`,
    height: sizes.mapAvenue,
    backgroundColor: colors.avenue,
    transform: [{ rotate: AVENIDA.angulo }],
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
  paraderoP: {
    width: sizes.mapStopP,
    height: sizes.mapStopP,
    borderRadius: radii.md,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.pin,
  },
  paraderoLetra: {
    color: colors.surface,
  },
  burbuja: {
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.chipGap,
    paddingLeft: sizes.mapBusPadding,
    paddingRight: spacing.md,
    paddingVertical: sizes.mapBusPadding,
    borderRadius: radii.pill,
    backgroundColor: colors.yellow,
    ...shadows.pin,
  },
  burbujaIcono: {
    width: sizes.mapBusCircle,
    height: sizes.mapBusCircle,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  ink: {
    color: colors.ink,
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
  // Debajo del halo del usuario: se baja medio halo más un margen
  etiquetaUsuario: {
    marginTop: sizes.mapUserHalo / 2 + spacing.xs,
    transform: [{ translateX: "-50%" }],
    paddingHorizontal: sizes.mapLabelPaddingX,
    paddingVertical: sizes.mapLabelPaddingY,
    borderRadius: radii.xs,
    borderWidth: borderWidths.thin,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
});
