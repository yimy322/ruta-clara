import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  House,
  MapPin,
  RotateCcw,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip, IconButton, ListItem } from "@/components";
import { CALLE_USUARIO } from "@/config/simulacion";
import { buscarDestinos, getDestinosComunes, getDestinosRecientes, getLugaresGuardados } from "@/data/repositorio";
import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
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
};

// "Jockey Pla" sobre "Jockey Plaza" → la parte que coincide va en negrita
function tituloResaltado(nombre: string, consulta: string) {
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
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
      buscarDestinos(consulta).then((destinos) => activo && setResultado({ consulta, destinos }));
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
      return (
        <Text style={[typography.body, styles.muted, styles.mensaje]}>
          No encontramos «{consulta}». Prueba con un distrito o centro comercial.
        </Text>
      );
    }
    return resultado.destinos.map((destino, i) => (
      <ListItem
        key={destino.id}
        badge={<MapPin />}
        title={tituloResaltado(destino.nombre, resultado.consulta)}
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
            <Text style={[typography.overline, styles.muted, styles.seccion]}>Sugerencias</Text>
            {renderSugerencias()}
          </>
        ) : (
          <>
            <Text style={[typography.overline, styles.muted, styles.seccion]}>Recientes</Text>
            {recientes.map((destino) => (
              <ListItem
                key={destino.id}
                badge={<RotateCcw />}
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

const styles = StyleSheet.create({
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
    height: sizes.fieldHeight,
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
  campoDestino: {
    borderColor: colors.ink,
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
  mensaje: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    textAlign: "center",
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
});
