import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { borderWidths, colors, opacity, radii, sizes, spacing, typography } from "@/theme";
import { withIconDefaults } from "@/utils/icons";

type ItemNotificacionProps = {
  icon: ReactNode;
  titulo: string;
  // Ya incluye la hora: "Reportado por 9 pasajeros · 6:48 AM"
  detalle: string;
  leida: boolean;
  onPress: () => void;
  // Llegada = amarillo de unidad en vivo; seguridad = rojo
  tono?: "llegada" | "seguridad";
};

// Aviso del centro de notificaciones (F3_04): ícono, título de hasta dos
// líneas, detalle y punto rojo si no está leído. Un aviso de llegada sin leer
// va con fondo amarillo suave.
export function ItemNotificacion({ icon, titulo, detalle, leida, onPress, tono }: ItemNotificacionProps) {
  const colorIcono = tono === "seguridad" ? colors.red : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}, ${detalle}${leida ? "" : ", sin leer"}`}
      style={({ pressed }) => [
        styles.base,
        tono === "llegada" && !leida && styles.destacado,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.icono, tono && iconoStyles[tono]]}>
        {withIconDefaults(icon, { color: colorIcono, size: sizes.chipIcon })}
      </View>
      <View style={styles.texto}>
        <Text style={[typography.bodyStrong, styles.ink]} numberOfLines={2}>
          {titulo}
        </Text>
        <Text style={[typography.caption, styles.muted]} numberOfLines={1}>
          {detalle}
        </Text>
      </View>
      {!leida && <View style={styles.noLeida} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: borderWidths.thin,
    borderBottomColor: colors.line,
  },
  destacado: {
    backgroundColor: colors.yellowSoft,
  },
  icono: {
    width: sizes.notifIcon,
    height: sizes.notifIcon,
    borderRadius: radii.sm,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  texto: {
    flex: 1,
    gap: spacing.xxs,
  },
  noLeida: {
    width: sizes.unreadDot,
    height: sizes.unreadDot,
    borderRadius: radii.pill,
    backgroundColor: colors.red,
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});

const iconoStyles = StyleSheet.create({
  llegada: {
    backgroundColor: colors.yellow,
  },
  seguridad: {
    backgroundColor: colors.redSoft,
    borderColor: colors.red,
  },
});
