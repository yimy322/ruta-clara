import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { Angry, Check, Frown, Laugh, Meh, Smile, X, type LucideIcon } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Chip, IconButton, Tile } from "@/components";
import { idsRecorrido, useViaje } from "@/context/ViajeContext";
import { crearReporte } from "@/data/repositorio";
import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
import { formatearEta, formatearHora, formatearPasaje } from "@/utils/formato";

const VALORACIONES: { valor: number; label: string; icono: LucideIcon }[] = [
  { valor: 1, label: "Pésimo", icono: Angry },
  { valor: 2, label: "Malo", icono: Frown },
  { valor: 3, label: "Normal", icono: Meh },
  { valor: 4, label: "Bueno", icono: Smile },
  { valor: 5, label: "Bacán", icono: Laugh },
];

const ETIQUETAS = ["Llegó rápido", "Lleno", "Conductor prudente", "Cobrador amable"];

// F1_10 · Finalización del viaje
export default function FinViaje() {
  const router = useRouter();
  const { viaje, limpiar } = useViaje();

  const [valoracion, setValoracion] = useState<number>();
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  // Cierra el modal y todo el stack del viaje, vuelve a Inicio y recién
  // entonces borra el viaje (así las pantallas de abajo no redirigen solas).
  const cerrar = useCallback(() => {
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.navigate("/");
    limpiar();
  }, [router, limpiar]);

  // En Android, el botón atrás cierra igual que la ✕ en vez de volver a A bordo
  useFocusEffect(
    useCallback(() => {
      const suscripcion = BackHandler.addEventListener("hardwareBackPress", () => {
        cerrar();
        return true;
      });
      return () => suscripcion.remove();
    }, [cerrar]),
  );

  if (!viaje) {
    return <Redirect href="/" />;
  }

  const fin = viaje.finEn ?? new Date().toISOString();
  const minutos = Math.max(Math.round((new Date(fin).getTime() - new Date(viaje.inicioEn).getTime()) / 60_000), 1);
  // Paraderos del tramo recorrido, contando el de subida (igual que "N de M" en A bordo)
  const paraderos = viaje.paraderoActual - idsRecorrido(viaje).indexOf(viaje.paraderoEspera.id) + 1;

  const alternarEtiqueta = (etiqueta: string) =>
    setEtiquetas((actuales) =>
      actuales.includes(etiqueta) ? actuales.filter((e) => e !== etiqueta) : [...actuales, etiqueta],
    );

  // Al terminar se cierra el viaje y se abre F2_08 sobre Inicio
  const enviar = async () => {
    setEnviando(true);
    try {
      const resultado = await crearReporte({
        tipo: "valoracion",
        modo: "ubicacion",
        lineaId: viaje.linea.id,
        valoracion,
        etiquetas,
        compartirEnVivo: false,
      });
      cerrar();
      router.push({
        pathname: "/reporte/gracias",
        params: {
          puntos: resultado.puntosGanados,
          total: resultado.usuario.puntos,
          personas: resultado.personasQueLoVen,
        },
      });
    } catch {
      Alert.alert("No se pudo enviar", "Revisa tu conexión e inténtalo otra vez.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Reintentar", onPress: enviar },
      ]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.arriba}>
        <IconButton icon={<X />} accessibilityLabel="Cerrar" onPress={cerrar} />
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.exito}>
          <Check color={colors.ink} size={sizes.successGlyph} />
        </View>
        <Text style={[typography.h1, styles.ink, styles.centrado]} accessibilityRole="header">
          ¡Llegaste a tu destino!
        </Text>
        <Text style={[typography.caption, styles.muted]}>
          {viaje.destino || viaje.paraderoEspera.nombre} · {formatearHora(fin)}
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={[typography.h2, styles.ink]}>{formatearEta(minutos)}</Text>
            <Text style={[typography.caption, styles.muted]}>tiempo total</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[typography.h2, styles.ink]}>{paraderos}</Text>
            <Text style={[typography.caption, styles.muted]}>paraderos</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[typography.h2, styles.ink]}>{formatearPasaje(viaje.linea.pasaje)}</Text>
            <Text style={[typography.caption, styles.muted]}>pasaje</Text>
          </View>
        </View>

        <View style={styles.pregunta}>
          <Text style={[typography.bodyStrong, styles.ink]}>¿Cómo estuvo el viaje?</Text>
          <Text style={[typography.caption, styles.muted]}>Ayuda a otros a saber cómo fue el viaje</Text>
        </View>

        <View style={styles.valoraciones} accessibilityRole="radiogroup">
          {VALORACIONES.map(({ valor, label, icono: Icono }) => (
            <Tile
              key={valor}
              label={label}
              icon={<Icono />}
              state={valoracion === valor ? "selected" : "default"}
              onPress={() => setValoracion(valor)}
              fill
            />
          ))}
        </View>

        <View style={styles.etiquetas}>
          {ETIQUETAS.map((etiqueta) => (
            <Chip
              key={etiqueta}
              label={etiqueta}
              state={etiquetas.includes(etiqueta) ? "selected" : "default"}
              onPress={() => alternarEtiqueta(etiqueta)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.pie}>
        <Button
          label={enviando ? "Enviando…" : "Enviar valoración · +5 pts"}
          onPress={enviar}
          disabled={valoracion === undefined || enviando}
          fullWidth
        />
        <Button label="Cerrar" variant="secondary" onPress={cerrar} fullWidth />
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
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  contenido: {
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  exito: {
    width: sizes.successIcon,
    height: sizes.successIcon,
    borderRadius: radii.pill,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  stats: {
    flexDirection: "row",
    alignSelf: "stretch",
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xxs,
    padding: sizes.statPadding,
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
  },
  pregunta: {
    alignSelf: "stretch",
    gap: spacing.xxs,
  },
  valoraciones: {
    flexDirection: "row",
    alignSelf: "stretch",
    gap: spacing.sm,
  },
  etiquetas: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "stretch",
    gap: spacing.sm,
  },
  pie: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
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
