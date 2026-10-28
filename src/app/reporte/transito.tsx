import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, LocateFixed, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Chip, Header, IconButton } from "@/components";
import { useReporte } from "@/context/ReporteContext";
import { getUbicacionUsuario, getViaCercana } from "@/data/repositorio";
import { useEnviarReporte } from "@/hooks/useEnviarReporte";
import { borderWidths, colors, opacity, radii, sizes, spacing, typography } from "@/theme";
import type { CausaTransito, NivelCongestion } from "@/types";
import { etiquetaCausa, etiquetaCongestion, textoVia } from "@/utils/formato";

const MAX_NOTA = 120;

// Color de la barra de intensidad de cada nivel
const NIVELES: { valor: NivelCongestion; barra: string }[] = [
  { valor: "fluido", barra: colors.line },
  { valor: "moderado", barra: colors.inkMuted },
  { valor: "pesado", barra: colors.ink },
  { valor: "trancadera", barra: colors.red },
];

const CAUSAS: CausaTransito[] = ["obras", "choque", "semaforo", "marcha", "fiscalizacion", "inundacion"];

const OPCIONES_FOTO: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.7 };

// F2_06 · Tránsito / Trancadera
export default function ReporteTransito() {
  const { borrador, actualizar } = useReporte();
  const { enviar, enviando } = useEnviarReporte();

  // undefined = detectando; null = no se encontró vía
  const [detectada, setDetectada] = useState<string | null>();
  // Cada cambio vuelve a detectar la vía ("Usar mi ubicación")
  const [deteccion, setDeteccion] = useState(0);
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState("");

  useEffect(() => {
    let activo = true;
    (async () => {
      const { lat, lng } = await getUbicacionUsuario();
      const encontrada = await getViaCercana(lat, lng);
      if (activo) {
        setDetectada(encontrada ? textoVia(encontrada) : null);
      }
    })();
    return () => {
      activo = false;
    };
  }, [deteccion]);

  // La escrita a mano tiene prioridad sobre la detectada
  const via = borrador.via ?? detectada ?? undefined;

  const editarVia = () => {
    setTextoEditado(via ?? "");
    setEditando(true);
  };

  // Si se deja vacía, vuelve a la detectada
  const guardarVia = () => {
    actualizar({ via: textoEditado.trim() || undefined });
    setEditando(false);
  };

  const usarMiUbicacion = () => {
    actualizar({ via: undefined });
    setEditando(false);
    setDetectada(undefined);
    setDeteccion((n) => n + 1);
  };

  const alternarCausa = (causa: CausaTransito) => {
    const causas = borrador.causas ?? [];
    actualizar({ causas: causas.includes(causa) ? causas.filter((c) => c !== causa) : [...causas, causa] });
  };

  const tomarFoto = async (origen: "camara" | "galeria") => {
    if (origen === "camara") {
      const permiso = await ImagePicker.requestCameraPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert("Sin acceso a la cámara", "Activa el permiso de cámara para tomar la foto.", [
          { text: "Cancelar", style: "cancel" },
          ...(permiso.canAskAgain ? [] : [{ text: "Abrir ajustes", onPress: () => Linking.openSettings() }]),
        ]);
        return;
      }
    }
    try {
      const resultado =
        origen === "camara"
          ? await ImagePicker.launchCameraAsync(OPCIONES_FOTO)
          : await ImagePicker.launchImageLibraryAsync(OPCIONES_FOTO);
      if (!resultado.canceled) {
        actualizar({ fotoUri: resultado.assets[0].uri });
      }
    } catch {
      Alert.alert("No se pudo añadir la foto", "Inténtalo otra vez.");
    }
  };

  const elegirFoto = () =>
    Alert.alert("Añadir foto", undefined, [
      { text: "Tomar foto", onPress: () => tomarFoto("camara") },
      { text: "Elegir de la galería", onPress: () => tomarFoto("galeria") },
      { text: "Cancelar", style: "cancel" },
    ]);

  const titulo = via ?? (detectada === null ? "Toca para escribir la vía" : "Detectando vía…");
  const nota = borrador.nota ?? "";

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header
        eyebrow="Reporte de tránsito"
        title={titulo}
        onPressTitle={editarVia}
        titleHint="Edita la vía del reporte"
      />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        {editando && (
          <TextInput
            value={textoEditado}
            onChangeText={setTextoEditado}
            onSubmitEditing={guardarVia}
            onBlur={guardarVia}
            autoFocus
            returnKeyType="done"
            placeholder="Ej. Av. Javier Prado · altura La Molina"
            placeholderTextColor={colors.inkMuted}
            accessibilityLabel="Vía"
            style={[typography.body, styles.ink, styles.campo, styles.campoVia]}
          />
        )}

        <Text style={[typography.bodyStrong, styles.ink]}>Nivel de congestión</Text>
        <View style={styles.niveles} accessibilityRole="radiogroup">
          {NIVELES.map(({ valor, barra }) => {
            const elegido = borrador.congestion === valor;
            const trancadera = valor === "trancadera";
            return (
              <Pressable
                key={valor}
                onPress={() => actualizar({ congestion: valor })}
                accessibilityRole="radio"
                accessibilityState={{ selected: elegido }}
                accessibilityLabel={etiquetaCongestion(valor)}
                style={({ pressed }) => [
                  styles.nivel,
                  // supuesto: Figma solo muestra Trancadera elegida (rojo); los
                  // demás usan el amarillo de selección
                  elegido && (trancadera ? styles.nivelTrancadera : styles.nivelElegido),
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.barra, { backgroundColor: barra }]} />
                <Text
                  style={[
                    elegido ? typography.captionStrong : typography.caption,
                    elegido && trancadera ? styles.red : styles.ink,
                  ]}
                  numberOfLines={1}
                >
                  {etiquetaCongestion(valor)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[typography.bodyStrong, styles.ink]}>
          ¿Qué está pasando? <Text style={typography.body}>(opcional)</Text>
        </Text>
        <View style={styles.chips}>
          {CAUSAS.map((causa) => (
            <Chip
              key={causa}
              label={etiquetaCausa(causa)}
              state={borrador.causas?.includes(causa) ? "selected" : "default"}
              onPress={() => alternarCausa(causa)}
            />
          ))}
        </View>

        <View style={[styles.campo, styles.nota]}>
          <TextInput
            value={nota}
            onChangeText={(texto) => actualizar({ nota: texto || undefined })}
            multiline
            maxLength={MAX_NOTA}
            placeholder="Nota rápida… ej. “Cerraron un carril por la Vía Expresa”"
            placeholderTextColor={colors.inkMuted}
            accessibilityLabel="Nota"
            style={[typography.body, styles.ink, styles.notaTexto]}
          />
          <Text style={[typography.caption, styles.muted, styles.contador]}>
            {nota.length}/{MAX_NOTA}
          </Text>
        </View>

        {borrador.fotoUri && (
          <View style={styles.foto}>
            <Image source={{ uri: borrador.fotoUri }} style={styles.miniatura} accessibilityLabel="Foto adjunta" />
            <IconButton icon={<X />} accessibilityLabel="Quitar foto" onPress={() => actualizar({ fotoUri: undefined })} />
          </View>
        )}

        <View style={styles.chips}>
          <Chip label={borrador.fotoUri ? "Cambiar foto" : "Añadir foto"} icon={<ImagePlus />} onPress={elegirFoto} />
          <Chip label="Usar mi ubicación" icon={<LocateFixed />} onPress={usarMiUbicacion} />
        </View>
      </ScrollView>

      <View style={styles.abajo}>
        <Button
          label={enviando ? "Enviando…" : "Enviar reporte"}
          onPress={() => enviar({ ...borrador, via })}
          disabled={!borrador.congestion || enviando}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  contenido: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  niveles: {
    flexDirection: "row",
    gap: sizes.congestionGap,
  },
  nivel: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: sizes.congestionPaddingX,
    paddingVertical: sizes.congestionPaddingY,
    borderRadius: sizes.optionRadius,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  nivelElegido: {
    borderWidth: borderWidths.medium,
    backgroundColor: colors.yellow,
  },
  nivelTrancadera: {
    borderWidth: borderWidths.medium,
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  barra: {
    alignSelf: "stretch",
    height: sizes.congestionBar,
    borderRadius: sizes.congestionBar / 2,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  campo: {
    borderRadius: sizes.optionRadius,
    borderWidth: borderWidths.regular,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  campoVia: {
    height: sizes.optionHeight,
    paddingHorizontal: spacing.md,
  },
  nota: {
    height: sizes.noteHeight,
    padding: spacing.md,
  },
  notaTexto: {
    flex: 1,
    padding: 0,
    textAlignVertical: "top",
  },
  contador: {
    textAlign: "right",
  },
  foto: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  miniatura: {
    width: sizes.photoThumb,
    height: sizes.photoThumb,
    borderRadius: radii.md,
    borderWidth: borderWidths.thin,
    borderColor: colors.line,
  },
  abajo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  pressed: {
    opacity: opacity.pressed,
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
});
