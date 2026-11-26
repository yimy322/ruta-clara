import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  House,
  ChevronRight,
  History,
  LocateFixed,
  MapPin,
  Search,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useEstilos, useTema } from "@/context/TemaContext";
import { Button, Chip, EstadoPantalla, IconButton, ListItem, useToast } from "@/components";
import { CALLE_USUARIO } from "@/config/simulacion";
import {
  buscarDestinos,
  getDestinosComunes,
  getDestinosRecientes,
  getLugaresGuardados,
  sugerirDestino,
} from "@/data/repositorio";
import { borderWidths, opacity, radii, sizes, spacing, type Tema } from "@/theme";
import type { Destino, LugarGuardado } from "@/types";
import { partirCoincidencia } from "@/utils/formato";

const ICONO_LUGAR: Record<LugarGuardado["nombre"], LucideIcon> = {
  Casa: House,
  Trabajo: Briefcase,
  U: GraduationCap,
};

const ORIGEN = "Mi ubicación";
const DEBOUNCE_MS = 250;

type Resultado = {
  consulta: string;
  destinos: Destino[];
  // Destino más parecido cuando no hay resultados (E1)
  sugerencia: Destino | null;
};

// "Jockey Pla" sobre "Jockey Plaza" → la parte que coincide va en negrita
function tituloResaltado(nombre: string, consulta: string, typography: Tema["typography"]) {
  const partes = partirCoincidencia(nombre, consulta);
  if (!partes) {
    return nombre;
  }
  const [antes, coincidencia, despues] = partes;
  return (
    <Text style={typography.body}>
      {antes}
      <Text style={typography.bodyStrong}>{coincidencia}</Text>
      {despues}
    </Text>
  );
}

// F1_05 · Búsqueda de destino
export default function Buscar() {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mostrar } = useToast();

  const [texto, setTexto] = useState("");
  // Última respuesta de buscarDestinos; puede ser de una consulta anterior
  const [resultado, setResultado] = useState<Resultado>();
  const [lugares, setLugares] = useState<LugarGuardado[]>([]);
  const [recientes, setRecientes] = useState<Destino[]>([]);
  const [comunes, setComunes] = useState<Destino[]>([]);

  const consulta = texto.trim();

  useEffect(() => {
    let activo = true;
    getLugaresGuardados().then((data) => activo && setLugares(data));
    getDestinosRecientes().then((data) => activo && setRecientes(data));
    getDestinosComunes().then((data) => activo && setComunes(data));
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!consulta) {
      return;
    }
    // Si llega la respuesta de una consulta vieja, se descarta
    let activo = true;
    const timer = setTimeout(() => {
      (async () => {
        const destinos = await buscarDestinos(consulta);
        const sugerencia = destinos.length === 0 ? await sugerirDestino(consulta) : null;
        if (activo) {
          setResultado({ consulta, destinos, sugerencia });
        }
      })();
    }, DEBOUNCE_MS);
    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [consulta]);

  const irARutas = (destino: string) => {
    const nombre = destino.trim();
    if (!nombre) {
      return;
    }
    router.push({ pathname: "/rutas", params: { origen: ORIGEN, destino: nombre } });
  };

  const vigente = resultado?.consulta === consulta;

  const renderSugerencias = () => {
    // Todavía no hay respuesta para lo escrito (o la anterior no sirve de guía)
    if (!resultado || (!vigente && resultado.destinos.length === 0)) {
      return <ActivityIndicator style={styles.cargando} color={colors.ink} />;
    }
    if (resultado.destinos.length === 0) {
      // E1 · Búsqueda sin resultados
      const { sugerencia } = resultado;
      return (
        <EstadoPantalla
          Icono={Search}
          tamano="compacto"
          titulo={`No encontramos «${resultado.consulta}»`}
          texto="Revisa cómo está escrito o prueba con un lugar conocido cerca de tu destino."
          acciones={
            <Button
              label="Elegir el destino en el mapa"
              variant="secondary"
              fullWidth
              // TODO Fase 6: elegir el destino tocando el mapa real
              onPress={() => mostrar("Elegir en el mapa estará disponible pronto")}
            />
          }
        >
          {sugerencia && (
            <View style={styles.sugerencia}>
              <Text style={[typography.overline, styles.muted]}>¿Quisiste decir…?</Text>
              <Pressable
                onPress={() => irARutas(sugerencia.nombre)}
                accessibilityRole="button"
                accessibilityLabel={`¿Quisiste decir ${sugerencia.nombre}?`}
                style={({ pressed }) => [styles.tarjeta, pressed && styles.pressed]}
              >
                <View style={styles.insignia}>
                  <MapPin color={colors.ink} size={sizes.iconGlyph} />
                </View>
                <View style={styles.tarjetaTexto}>
                  <Text style={[typography.bodyStrong, styles.ink]}>{sugerencia.nombre}</Text>
                  <Text style={[typography.caption, styles.muted]}>{sugerencia.distrito}</Text>
                </View>
                <ChevronRight color={colors.ink} size={sizes.chevron} />
              </Pressable>
            </View>
          )}
        </EstadoPantalla>
      );
    }
    return resultado.destinos.map((destino, i) => (
      <ListItem
        key={destino.id}
        badge={<LocateFixed />}
        title={tituloResaltado(destino.nombre, resultado.consulta, typography)}
        subtitle={destino.distrito}
        destacado={i === 0}
        onPress={() => irARutas(destino.nombre)}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <View style={[styles.arriba, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton icon={<ArrowLeft />} accessibilityLabel="Volver" onPress={() => router.back()} />
        <View style={styles.campos}>
          <View style={[styles.campo, styles.campoOrigen]} accessibilityLabel={`Origen: ${ORIGEN}`}>
            <View style={[styles.punto, styles.puntoOrigen]} />
            <Text style={[typography.caption, styles.ink]} numberOfLines={1}>
              {ORIGEN} · {CALLE_USUARIO}
            </Text>
          </View>
          <View style={[styles.campo, styles.campoDestino]}>
            <View style={[styles.punto, styles.puntoDestino]} />
            <TextInput
              value={texto}
              onChangeText={setTexto}
              onSubmitEditing={() => irARutas(texto)}
              autoFocus
              returnKeyType="search"
              autoCorrect={false}
              placeholder="¿A dónde vas?"
              placeholderTextColor={colors.inkMuted}
              accessibilityLabel="Destino"
              style={[typography.body, styles.ink, styles.input]}
            />
            {texto.length > 0 && (
              <Pressable
                onPress={() => setTexto("")}
                hitSlop={spacing.md}
                accessibilityRole="button"
                accessibilityLabel="Borrar destino"
              >
                <X color={colors.ink} size={sizes.errorIcono} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={styles.lugaresScroll}
        contentContainerStyle={styles.lugares}
      >
        {lugares.map((lugar) => {
          const Icono = ICONO_LUGAR[lugar.nombre];
          return <Chip key={lugar.id} label={lugar.nombre} icon={<Icono />} onPress={() => irARutas(lugar.nombre)} />;
        })}
      </ScrollView>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.contenido}>
        {consulta ? (
          <>
            {!(vigente && resultado?.destinos.length === 0) && (
              <Text style={[typography.overline, styles.muted, styles.seccion]}>Sugerencias</Text>
            )}
            {renderSugerencias()}
          </>
        ) : (
          <>
            <Text style={[typography.overline, styles.muted, styles.seccion]}>Recientes</Text>
            {recientes.map((destino) => (
              <ListItem
                key={destino.id}
                badge={<History />}
                title={destino.nombre}
                subtitle={destino.distrito}
                onPress={() => irARutas(destino.nombre)}
              />
            ))}
            <Text style={[typography.overline, styles.muted, styles.seccion]}>Destinos comunes</Text>
            <View style={styles.comunes}>
              {comunes.map((destino) => (
                <Chip key={destino.id} label={destino.nombre} onPress={() => irARutas(destino.nombre)} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    sugerencia: {
      alignSelf: "stretch",
      gap: spacing.sm,
      paddingTop: spacing.lg,
    },
    tarjeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal: sizes.cardPadding,
      paddingVertical: spacing.md,
      borderRadius: radii.control,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    insignia: {
      width: sizes.badge,
      height: sizes.badge,
      borderRadius: radii.badge,
      backgroundColor: colors.yellowSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    tarjetaTexto: {
      flex: 1,
      gap: spacing.xxs,
    },
    pressed: {
      opacity: opacity.pressed,
    },
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    arriba: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    campos: {
      flex: 1,
      gap: spacing.sm,
    },
    campo: {
      // Altura mínima: con texto grande (hasta 200 %) el control crece en vez de cortar el texto
      minHeight: sizes.fieldHeight,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radii.md,
      borderWidth: borderWidths.regular,
      backgroundColor: colors.surface,
    },
    campoOrigen: {
      borderColor: colors.line,
    },
    // Campo activo: tarjeta con sombra, sin borde
    campoDestino: {
      borderColor: "transparent",
      borderRadius: radii.control,
      ...shadows.card,
    },
    punto: {
      width: sizes.fieldDot,
      height: sizes.fieldDot,
      borderRadius: radii.pill,
    },
    puntoOrigen: {
      backgroundColor: colors.blue,
    },
    puntoDestino: {
      backgroundColor: colors.red,
    },
    input: {
      flex: 1,
      height: "100%",
      paddingVertical: 0,
    },
    // Sin esto el ScrollView horizontal se estira y empuja la lista hacia abajo
    lugaresScroll: {
      flexGrow: 0,
    },
    lugares: {
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    contenido: {
      paddingBottom: spacing.lg,
    },
    seccion: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
    },
    comunes: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    cargando: {
      paddingVertical: spacing.xl,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
  });
