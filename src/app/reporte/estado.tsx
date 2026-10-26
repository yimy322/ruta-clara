import { useRouter } from "expo-router";
import { Armchair, Gauge, Hourglass, TrafficCone, Users, UsersRound, type LucideIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BarraProgreso, Button, Header, Segmented, Tile } from "@/components";
import { useReporte } from "@/context/ReporteContext";
import { useViaje } from "@/context/ViajeContext";
import { getLinea } from "@/data/repositorio";
import { colors, spacing, typography } from "@/theme";
import type { EnUnidad, Linea, Ocupacion, Velocidad } from "@/types";

type Opcion<T> = { valor: T; label: string; icono: LucideIcon };

const EN_UNIDAD: { valor: EnUnidad; label: string }[] = [
  { valor: "a_bordo", label: "A bordo" },
  { valor: "paradero", label: "En el paradero" },
];

// Íconos provisionales: en Figma son círculos
const OCUPACIONES: Opcion<Ocupacion>[] = [
  { valor: "sentados", label: "Vacío / Sentados", icono: Armchair },
  { valor: "lleno", label: "Lleno", icono: Users },
  { valor: "sopa", label: "Sopa · apretadísimo", icono: UsersRound },
];

const VELOCIDADES: Opcion<Velocidad>[] = [
  { valor: "normal", label: "Normal", icono: Gauge },
  { valor: "lento", label: "Lento / Tránsito", icono: TrafficCone },
  { valor: "chanteando", label: "Chanteando · para mucho", icono: Hourglass },
];

// F2_03 · Estado del carro (paso 2 de 3)
export default function EstadoUnidad() {
  const router = useRouter();
  const { viaje } = useViaje();
  const { borrador, actualizar } = useReporte();

  const [linea, setLinea] = useState<Linea | null>();

  useEffect(() => {
    if (!borrador.lineaId) {
      return;
    }
    let activo = true;
    getLinea(borrador.lineaId).then((encontrada) => activo && setLinea(encontrada));
    return () => {
      activo = false;
    };
  }, [borrador.lineaId]);

  // Si no lo eligió, se asume según el viaje activo
  const enUnidad = borrador.enUnidad ?? (viaje?.estado === "a_bordo" ? "a_bordo" : "paradero");

  const continuar = () => {
    actualizar({ enUnidad });
    router.push("/reporte/ubicacion");
  };

  // Selección única por grupo; tocar la elegida la quita
  const renderGrupo = <T extends string>(opciones: Opcion<T>[], elegida: T | undefined, elegir: (valor?: T) => void) => (
    <View style={styles.fila} accessibilityRole="radiogroup">
      {opciones.map(({ valor, label, icono: Icono }) => (
        <Tile
          key={valor}
          label={label}
          icon={<Icono />}
          state={elegida === valor ? "selected" : "default"}
          onPress={() => elegir(elegida === valor ? undefined : valor)}
          fill
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header eyebrow={linea ? `Paso 2 de 3 · ${linea.codigo}` : "Paso 2 de 3"} title="¿Cómo está la unidad?" />

      <ScrollView contentContainerStyle={styles.contenido}>
        <BarraProgreso progreso={2 / 3} />

        <Text style={[typography.bodyStrong, styles.ink]}>¿Estás…?</Text>
        <Segmented opciones={EN_UNIDAD} valor={enUnidad} onChange={(valor) => actualizar({ enUnidad: valor })} />

        <Text style={[typography.bodyStrong, styles.ink]}>¿Cómo va?</Text>
        {renderGrupo(OCUPACIONES, borrador.ocupacion, (ocupacion) => actualizar({ ocupacion }))}

        <Text style={[typography.bodyStrong, styles.ink]}>¿A qué velocidad?</Text>
        {renderGrupo(VELOCIDADES, borrador.velocidad, (velocidad) => actualizar({ velocidad }))}
      </ScrollView>

      <View style={styles.abajo}>
        <Button
          label="Continuar"
          onPress={continuar}
          disabled={!borrador.ocupacion && !borrador.velocidad}
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
    paddingBottom: spacing.lg,
  },
  fila: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  abajo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  ink: {
    color: colors.ink,
  },
});
