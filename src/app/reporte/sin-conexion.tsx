import { useLocalSearchParams } from "expo-router";
import { Bus, Clock, CloudOff, ShieldAlert, Split, Star, TrafficCone, Users, X, type LucideIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useEstilos, useTema } from "@/context/TemaContext";
import { Button, Chip, EstadoPantalla, IconButton, useToast } from "@/components";
import { PUNTOS_POR_TIPO } from "@/config/gamificacion";
import { CALLE_USUARIO } from "@/config/simulacion";
import { useColaReportes } from "@/context/ColaReportesContext";
import { useReporte } from "@/context/ReporteContext";
import { getLinea } from "@/data/repositorio";
import { radii, sizes, spacing, type Tema } from "@/theme";
import type { Linea, TipoReporte } from "@/types";
import { etiquetaReporteRapido, formatearHora } from "@/utils/formato";

// Ícono de cada tipo de reporte, como en el panel F2_01
const ICONO: Record<TipoReporte, LucideIcon> = {
  ubicacion: Bus,
  paradero: Users,
  transito: TrafficCone,
  seguridad: ShieldAlert,
  desvio: Split,
  valoracion: Star,
};

// E3 · Reporte sin conexión: el reporte quedó en la cola del dispositivo y
// se enviará solo cuando vuelva la señal (ColaReportesProvider).
export default function SinConexion() {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cerrar } = useReporte();
  const { cola, reintentar } = useColaReportes();
  const { mostrar } = useToast();

  const [linea, setLinea] = useState<Linea | null>(null);
  const [reintentando, setReintentando] = useState(false);

  const item = cola.find((c) => c.id === id);
  const lineaId = item?.borrador.lineaId;

  useEffect(() => {
    if (lineaId) {
      getLinea(lineaId)
        .then(setLinea)
        .catch(() => {});
    }
  }, [lineaId]);

  const reintentarAhora = async () => {
    setReintentando(true);
    const vacia = await reintentar();
    setReintentando(false);
    if (vacia) {
      // El toast de puntos lo muestra ColaReportesProvider
      cerrar();
    } else {
      mostrar("Seguimos sin conexión. Lo enviaremos apenas vuelva la señal.");
    }
  };

  const tipo = item?.borrador.tipo;
  const Icono = tipo ? ICONO[tipo] : Bus;
  const titulo = tipo ? `${etiquetaReporteRapido(tipo)}${linea ? ` · ${linea.nombre}` : ""}` : "Tu reporte";

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <View style={[styles.arriba, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton icon={<X />} accessibilityLabel="Cerrar" onPress={cerrar} />
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        <EstadoPantalla
          Icono={CloudOff}
          tamano="grande"
          tituloGrande
          titulo="Sin señal por ahora"
          texto="Guardamos tu reporte. Lo enviaremos automáticamente cuando vuelvas a tener conexión."
        >
          {/* Si ya se envió (p. ej. volvió la red), la tarjeta deja de mostrarse */}
          {item && tipo && (
            <View style={styles.tarjeta} accessible accessibilityLabel={`${titulo}, en cola`}>
              <View style={styles.fila}>
                <View style={styles.insignia}>
                  <Icono color={colors.ink} size={sizes.iconGlyph} />
                </View>
                <View style={styles.texto}>
                  <Text style={[typography.bodyStrong, styles.ink]} numberOfLines={2}>
                    {titulo}
                  </Text>
                  <Text style={[typography.caption, styles.muted]} numberOfLines={1}>
                    Guardado {formatearHora(item.guardadoEn)} · {CALLE_USUARIO}
                  </Text>
                </View>
                <Chip label="En cola" icon={<Clock />} />
              </View>
              <View style={styles.puntos}>
                <Star color={colors.yellowDeep} fill={colors.yellowDeep} size={sizes.mapBusGlyph} />
                <Text style={[typography.caption, styles.muted]}>
                  Recibirás +{PUNTOS_POR_TIPO[tipo]} pts cuando se envíe
                </Text>
              </View>
            </View>
          )}
        </EstadoPantalla>
      </ScrollView>

      <View style={styles.pie}>
        <Button label="Volver al mapa" onPress={cerrar} fullWidth />
        <Button
          label={reintentando ? "Reintentando…" : "Reintentar ahora"}
          variant="secondary"
          onPress={reintentarAhora}
          disabled={reintentando}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    arriba: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: spacing.lg,
    },
    contenido: {
      flexGrow: 1,
    },
    tarjeta: {
      alignSelf: "stretch",
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radii.control,
      backgroundColor: colors.surface,
    },
    fila: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    insignia: {
      width: sizes.badge,
      height: sizes.badge,
      borderRadius: radii.badge,
      backgroundColor: colors.canvas,
      alignItems: "center",
      justifyContent: "center",
    },
    texto: {
      flex: 1,
      gap: spacing.xxs,
    },
    puntos: {
      flexDirection: "row",
      alignItems: "center",
      gap: sizes.chipGap,
    },
    pie: {
      gap: spacing.md,
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
