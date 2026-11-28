import { Bus, Clock, TriangleAlert } from "lucide-react-native";
import { useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
import { StyleSheet, Text, View, type Insets, type StyleProp, type ViewStyle } from "react-native";
import MapView, { Circle, Marker, Polyline, type Region } from "react-native-maps";

import { RADIO_ZONA_ALTA_M, RADIO_ZONA_MEDIA_M } from "@/config/reportes";
import { usePreferencias } from "@/context/PreferenciasContext";
import { useEstilos, useTema } from "@/context/TemaContext";
import { useReducirMovimiento } from "@/hooks/useReducirMovimiento";
import { borderWidths, opacity, radii, sizes, spacing, type Paleta, type Tema } from "@/theme";
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

// Zona de calor del mapa de seguridad (F3_06)
type ZonaMapa = {
  id: string;
  lat: number;
  lng: number;
  nivel: NivelZona;
};

// Radio (m) y color de cada nivel (zonas de F3_06)
const estiloZonas = (colors: Paleta): Record<NivelZona, { radio: number; color: string }> => ({
  alto: { radio: RADIO_ZONA_ALTA_M, color: colors.red },
  medio: { radio: RADIO_ZONA_MEDIA_M, color: colors.amber },
});

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
  // Zonas de calor de seguridad, debajo de los demás puntos (F3_06)
  zonas?: ZonaMapa[];
  // Espacio tapado por controles flotantes: el encuadre lo deja libre
  margen?: Insets;
  // Se puede mover y hacer zoom (pantallas de mapa completo). Por defecto
  // fijo, para no competir con el scroll de la pantalla
  interactivo?: boolean;
  // Destino de la búsqueda (F1_06): marcador rojo y línea punteada recta desde el usuario
  destino?: Coordenada;
  // Centro inicial cuando no hay puntos que encuadrar (F2_04)
  centro?: Coordenada;
  // Al soltar el mapa tras moverlo: el nuevo centro (pin fijo de F2_04). Hace el mapa interactivo
  alMover?: (centro: Coordenada) => void;
  ref?: Ref<MapaRef>;
  estilo?: StyleProp<ViewStyle>;
};

// Control desde la pantalla («centrar en mí» de F1_04)
export type MapaRef = {
  centrarEn: (punto: Coordenada) => void;
};

// Lado mínimo de la región en grados (~550 m), para que un solo punto no llene el mapa
const SPAN_MINIMO = 0.005;
// Aire alrededor del punto más lejano
const AIRE = 1.3;
const DURACION_ENCUADRE_MS = 400;
// Los marcadores se redibujan un momento tras cada cambio y luego se fijan (batería)
const SEGUIR_CAMBIOS_MS = 1000;

// Región centrada en el usuario si lo hay (como un mapa real); si no, en el
// centro de los puntos. Abarca el punto más lejano con algo de aire.
function calcularRegion(puntos: Coordenada[], centro?: Coordenada): Region | undefined {
  if (puntos.length === 0) {
    return undefined;
  }
  const lats = puntos.map((p) => p.lat);
  const lngs = puntos.map((p) => p.lng);
  const latitude = centro?.lat ?? (Math.min(...lats) + Math.max(...lats)) / 2;
  const longitude = centro?.lng ?? (Math.min(...lngs) + Math.max(...lngs)) / 2;
  const lejosLat = Math.max(...lats.map((lat) => Math.abs(lat - latitude)));
  const lejosLng = Math.max(...lngs.map((lng) => Math.abs(lng - longitude)));
  return {
    latitude,
    longitude,
    latitudeDelta: Math.max(2 * lejosLat * AIRE, SPAN_MINIMO),
    longitudeDelta: Math.max(2 * lejosLng * AIRE, SPAN_MINIMO),
  };
}

// "#C93B29" + 0.55 → "rgba(201, 59, 41, 0.55)"
function conAlfa(hex: string, alfa: number) {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
}

const coordenada = ({ lat, lng }: Coordenada) => ({ latitude: lat, longitude: lng });

// Mapa real (Fase 6, react-native-maps: Apple Maps en iOS). Los marcadores,
// chips y zonas mantienen el estilo de RutaClara; el fondo es el del
// proveedor (decisión 64). Es decorativo para el lector de pantalla: la
// información está en las listas de cada pantalla.
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
  interactivo = false,
  destino,
  centro,
  alMover,
  ref,
  estilo,
}: MapaProps) {
  const { colors, esquema, typography } = useTema();
  const styles = useEstilos(crearEstilos);
  // Señales sin depender del color (Accesibilidad)
  const senales = usePreferencias().ajustes.senalesSinColor;
  const reducirMovimiento = useReducirMovimiento();
  const mapa = useRef<MapView>(null);

  // Las unidades no cuentan para el encuadre: se mueven en tiempo real y el
  // mapa no debe saltar cada vez
  const fijos: Coordenada[] = [...(usuario ? [usuario] : []), ...(destino ? [destino] : []), ...paraderos, ...zonas];
  const respaldo = unidades.length > 0 ? unidades : centro ? [centro] : [];
  const region = calcularRegion(fijos.length > 0 ? fijos : respaldo, usuario ?? centro);
  const claveEncuadre = region
    ? [region.latitude, region.longitude, region.latitudeDelta, region.longitudeDelta].map((n) => n.toFixed(5)).join()
    : "";

  // Reencuadra si cambian los puntos fijos (la región inicial cubre el primer render)
  const primerEncuadre = useRef(claveEncuadre);
  useEffect(() => {
    if (!region || claveEncuadre === primerEncuadre.current) {
      return;
    }
    primerEncuadre.current = claveEncuadre;
    mapa.current?.animateToRegion(region, reducirMovimiento ? 0 : DURACION_ENCUADRE_MS);
    // region se recalcula en cada render; claveEncuadre resume sus valores
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveEncuadre, reducirMovimiento]);

  useImperativeHandle(ref, () => ({
    centrarEn: ({ lat, lng }) =>
      mapa.current?.animateToRegion(
        { latitude: lat, longitude: lng, latitudeDelta: SPAN_MINIMO, longitudeDelta: SPAN_MINIMO },
        reducirMovimiento ? 0 : DURACION_ENCUADRE_MS,
      ),
  }));

  const movible = interactivo || alMover != null;

  // Redibuja los marcadores un momento cuando cambia su contenido o el tema
  const claveMarcadores = [esquema, senales, ...unidades.map((u) => `${u.linea.id}:${u.etiqueta ?? ""}`)].join();
  const [seguir, setSeguir] = useState({ clave: claveMarcadores, activo: true });
  if (seguir.clave !== claveMarcadores) {
    setSeguir({ clave: claveMarcadores, activo: true });
  }
  useEffect(() => {
    if (!seguir.activo) {
      return;
    }
    const id = setTimeout(() => setSeguir((actual) => ({ ...actual, activo: false })), SEGUIR_CAMBIOS_MS);
    return () => clearTimeout(id);
  }, [seguir]);
  const tracksViewChanges = seguir.activo;

  return (
    <View
      style={[styles.base, estilo]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <MapView
        ref={mapa}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        mapPadding={{ top: margen?.top ?? 0, right: margen?.right ?? 0, bottom: margen?.bottom ?? 0, left: margen?.left ?? 0 }}
        userInterfaceStyle={esquema === "oscuro" ? "dark" : "light"}
        scrollEnabled={movible}
        zoomEnabled={movible}
        // isGesture solo llega en Google Maps; en iOS cualquier fin de movimiento cuenta
        onRegionChangeComplete={
          alMover
            ? (r, detalles) => {
                if (detalles?.isGesture !== false) {
                  alMover({ lat: r.latitude, lng: r.longitude });
                }
              }
            : undefined
        }
        rotateEnabled={false}
        pitchEnabled={false}
        showsPointsOfInterests={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {zonas.map((zona) => {
          const { radio, color } = estiloZonas(colors)[zona.nivel];
          return (
            <Circle
              key={`z${zona.id}`}
              center={coordenada(zona)}
              radius={radio}
              fillColor={conAlfa(color, opacity.zonaCentro)}
              strokeColor={color}
              strokeWidth={borderWidths.thin}
            />
          );
        })}

        {senales &&
          zonas.map((zona) => (
            <Marker key={`zi${zona.id}`} coordinate={coordenada(zona)} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={tracksViewChanges}>
              {zona.nivel === "alto" ? (
                <TriangleAlert color={colors.redStrong} size={sizes.iconGlyph} />
              ) : (
                <Clock color={colors.ink} size={sizes.iconGlyph} />
              )}
            </Marker>
          ))}

        {recorrido && paraderos.length > 1 && (
          <Polyline coordinates={paraderos.map(coordenada)} strokeColor={colors.ink} strokeWidth={sizes.mapRoute} />
        )}

        {usuario &&
          seguimiento &&
          unidades.map((unidad) => (
            <Polyline
              key={`s${unidad.linea.id}`}
              coordinates={[coordenada(unidad), coordenada(usuario)]}
              strokeColor={colors.ink}
              strokeWidth={sizes.mapRoute}
              lineDashPattern={[sizes.mapDash, sizes.mapDash]}
            />
          ))}

        {usuario && destino && (
          <Polyline
            coordinates={[coordenada(usuario), coordenada(destino)]}
            strokeColor={colors.ink}
            strokeWidth={sizes.mapRoute}
            lineDashPattern={[sizes.mapDash, sizes.mapDash]}
          />
        )}

        {paraderos.map((paradero) => (
          <Marker key={paradero.id} coordinate={coordenada(paradero)} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={tracksViewChanges}>
            <View style={marcadorParadero === "P" ? styles.paraderoP : styles.paradero}>
              {marcadorParadero === "P" ? (
                <Text style={[typography.captionStrong, styles.paraderoLetra]}>P</Text>
              ) : (
                <View style={styles.paraderoCentro} />
              )}
            </View>
          </Marker>
        ))}

        {destino && (
          <Marker coordinate={coordenada(destino)} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={tracksViewChanges}>
            <View style={styles.destino}>
              <View style={styles.destinoCentro} />
            </View>
          </Marker>
        )}

        {usuario && (
          <Marker coordinate={coordenada(usuario)} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={tracksViewChanges}>
            <View style={styles.halo}>
              <View style={styles.usuario} />
            </View>
          </Marker>
        )}

        {usuario && etiquetaUsuario != null && (
          // Anclado por arriba en el usuario y bajado medio halo: queda debajo del punto
          <Marker coordinate={coordenada(usuario)} anchor={{ x: 0.5, y: 0 }} tracksViewChanges={tracksViewChanges}>
            <View style={styles.etiquetaUsuario}>
              <Text style={[typography.caption, styles.etiquetaTexto]} numberOfLines={1}>
                {etiquetaUsuario}
              </Text>
            </View>
          </Marker>
        )}

        {unidades.map((unidad) => (
          <Marker key={unidad.linea.id} coordinate={coordenada(unidad)} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={tracksViewChanges}>
            {estiloUnidad === "burbuja" ? (
              <View style={styles.burbuja}>
                <View style={styles.burbujaIcono}>
                  {/* supuesto: Figma no deja ver el color del ícono; amarillo sobre el círculo negro */}
                  <Bus color={colors.yellow} size={sizes.mapBusGlyph} />
                </View>
                <Text style={[typography.captionStrong, styles.sobreAmarillo]} numberOfLines={1}>
                  {unidad.etiqueta ?? unidad.linea.nombre}
                </Text>
              </View>
            ) : (
              <Chip label={unidad.etiqueta ?? unidad.linea.nombre} icon={unidad.icono} state="live" />
            )}
          </Marker>
        ))}
      </MapView>

      {etiqueta != null && (
        <View style={styles.etiqueta} pointerEvents="none">
          <Text style={[typography.overline, styles.etiquetaTexto]} numberOfLines={1}>
            {etiqueta}
          </Text>
        </View>
      )}
    </View>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    base: {
      backgroundColor: colors.map,
      overflow: "hidden",
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
    // Destino (F1_06): punto rojo con anillo blanco y borde negro
    destino: {
      width: sizes.mapStopP,
      height: sizes.mapStopP,
      borderRadius: radii.pill,
      backgroundColor: colors.surface,
      borderWidth: borderWidths.regular,
      borderColor: colors.ink,
      alignItems: "center",
      justifyContent: "center",
      ...shadows.pin,
    },
    destinoCentro: {
      width: sizes.mapStop / 2 + spacing.xs,
      height: sizes.mapStop / 2 + spacing.xs,
      borderRadius: radii.pill,
      backgroundColor: colors.red,
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
      backgroundColor: colors.onYellow,
      alignItems: "center",
      justifyContent: "center",
    },
    // Ícono centrado sobre la mancha (señales sin depender del color)
    sobreAmarillo: {
      color: colors.onYellow,
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
      paddingHorizontal: sizes.mapLabelPaddingX,
      paddingVertical: sizes.mapLabelPaddingY,
      borderRadius: radii.xs,
      borderWidth: borderWidths.thin,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
  });
