import { LocateFixed } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { radii, sizes, spacing, type Tema } from "@/theme";

import { Button } from "./Button";

type BannerUbicacionProps = {
  // false cuando el usuario ya rechazó el permiso y solo queda ir a ajustes
  puedePedir: boolean;
  onPress: () => void;
  // Alternativa sin ubicación: buscar el destino a mano
  onBuscar: () => void;
};

// E10 · Inicio sin permiso de ubicación: reemplaza a la card del paradero
// cercano. Explica qué pasa y ofrece una salida sin ubicación.
export function BannerUbicacion({ puedePedir, onPress, onBuscar }: BannerUbicacionProps) {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  return (
    <View style={styles.card}>
      <View style={styles.fila}>
        <View style={styles.icono} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <LocateFixed color={colors.ink} size={sizes.permisoGlyph} />
        </View>
        <View style={styles.texto}>
          <Text style={[typography.title, styles.ink]} accessibilityRole="header">
            Activa tu ubicación
          </Text>
          <Text style={[typography.caption, styles.muted]}>
            Sin tu ubicación no podemos mostrarte paraderos ni combis cerca de ti.
          </Text>
        </View>
      </View>
      <View style={styles.acciones}>
        <View style={styles.principal}>
          {/* Si todavía se puede pedir el permiso, se pide aquí; si no, solo queda Ajustes */}
          <Button label={puedePedir ? "Activar ubicación" : "Abrir ajustes"} onPress={onPress} fullWidth />
        </View>
        <Button label="Buscar destino" variant="tertiary" onPress={onBuscar} />
      </View>
    </View>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    card: {
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radii.xl,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    fila: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    icono: {
      width: sizes.permisoIcono,
      height: sizes.permisoIcono,
      borderRadius: radii.lg,
      backgroundColor: colors.yellowSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    texto: {
      flex: 1,
      gap: spacing.xs,
    },
    acciones: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    principal: {
      flex: 1,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
  });
