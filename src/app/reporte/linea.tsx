import { useRouter } from "expo-router";
import { Plus, Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BarraProgreso, Button, Header, ListItem, useToast } from "@/components";
import { CALLE_USUARIO } from "@/config/simulacion";
import { useReporte } from "@/context/ReporteContext";
import { buscarLineas, getLineasSugeridas, getUbicacionUsuario } from "@/data/repositorio";
import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
import type { Linea, LineaSugerida } from "@/types";
import { textoLineaSugerida } from "@/utils/formato";

const DEBOUNCE_MS = 250;

type Resultado = {
  consulta: string;
  lineas: LineaSugerida[];
};

// F2_02 · Ubicación de unidad — Línea (paso 1 de 3)
export default function ElegirLinea() {
  const router = useRouter();
  const { mostrar } = useToast();
  const { borrador, actualizar } = useReporte();

  const [texto, setTexto] = useState("");
  const [sugeridas, setSugeridas] = useState<LineaSugerida[]>();
  // Última respuesta de buscarLineas; puede ser de una consulta anterior
  const [resultado, setResultado] = useState<Resultado>();

  const consulta = texto.trim();

  useEffect(() => {
    let activo = true;
    (async () => {
      const { lat, lng } = await getUbicacionUsuario();
      const lineas = await getLineasSugeridas(lat, lng);
      if (activo) {
        setSugeridas(lineas);
      }
    })();
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
      buscarLineas(consulta).then((lineas) => activo && setResultado({ consulta, lineas }));
    }, DEBOUNCE_MS);
    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [consulta]);

  const elegir = (linea: Linea) => {
    actualizar({ lineaId: linea.id });
    if (borrador.modo === "desvio") {
      // TODO: paso para trazar el desvío en el mapa
      mostrar("Pronto podrás trazar el desvío");
      return;
    }
    router.push("/reporte/estado");
  };

  const noEncuentro = () => {
    Alert.alert(
      "¿No encuentras tu línea?",
      "Muy pronto podrás registrar líneas nuevas. Mientras tanto, prueba buscando por el número o la empresa.",
    );
  };

  const renderLineas = (lineas: LineaSugerida[]) =>
    lineas.map((sugerida, i) => (
      <ListItem
        key={sugerida.linea.id}
        badge={sugerida.linea.codigo}
        title={sugerida.linea.nombre}
        subtitle={textoLineaSugerida(sugerida)}
        trailing="›"
        destacado={i === 0}
        onPress={() => elegir(sugerida.linea)}
      />
    ));

  const renderContenido = () => {
    if (!consulta) {
      if (!sugeridas) {
        return <ActivityIndicator style={styles.cargando} color={colors.ink} />;
      }
      return renderLineas(sugeridas);
    }
    // Todavía no hay respuesta para lo escrito (o la anterior no sirve de guía)
    if (!resultado || (resultado.consulta !== consulta && resultado.lineas.length === 0)) {
      return <ActivityIndicator style={styles.cargando} color={colors.ink} />;
    }
    if (resultado.lineas.length === 0) {
      return (
        <Text style={[typography.body, styles.muted, styles.mensaje]}>
          No encontramos «{consulta}». Prueba con el número de la línea o la empresa.
        </Text>
      );
    }
    return renderLineas(resultado.lineas);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header eyebrow="Paso 1 de 3" title="¿Qué carro estás viendo?" />

      <View style={styles.arriba}>
        <BarraProgreso progreso={1 / 3} />
        <View style={styles.buscador}>
          <Search color={colors.inkMuted} size={sizes.iconGlyph} />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            returnKeyType="search"
            autoCorrect={false}
            placeholder="Busca línea o empresa (ej. La 50)"
            placeholderTextColor={colors.inkMuted}
            accessibilityLabel="Buscar línea"
            style={[typography.body, styles.ink, styles.input]}
          />
        </View>
        <Text style={[typography.overline, styles.muted]}>
          {consulta ? "Resultados" : `Sugeridas por GPS · ${CALLE_USUARIO}`}
        </Text>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" style={styles.lista}>
        {renderContenido()}
      </ScrollView>

      <View style={styles.abajo}>
        <Button label="No encuentro mi línea" icon={<Plus />} variant="secondary" fullWidth onPress={noEncuentro} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  arriba: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  buscador: {
    height: sizes.searchHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
  },
  lista: {
    flex: 1,
  },
  cargando: {
    paddingVertical: spacing.xl,
  },
  mensaje: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  abajo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
});
