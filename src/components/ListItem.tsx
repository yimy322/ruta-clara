import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useEstilos, useTema } from "@/context/TemaContext";
import { borderWidths, opacity, radii, sizes, spacing, type Tema } from "@/theme";
import { withIconDefaults } from "@/utils/icons";

type ListItemProps = {
  // Puede llevar <Text> anidados (p. ej. para resaltar parte del título)
  title: ReactNode;
  subtitle?: string;
  badge?: string | ReactNode;
  trailing?: string | ReactNode;
  onPress?: () => void;
  // Fondo amarillo suave: la opción sugerida
  destacado?: boolean;
  // Sin margen lateral, para listas dentro de un contenido que ya tiene
  // márgenes (F1_07)
  enTarjeta?: boolean;
  // Con enTarjeta: padding vertical de 12 en vez de 8 (F3_02)
  amplio?: boolean;
};

// Fila de lista (Figma 73:1007): insignia de 40 pt (número de ruta o ícono),
// título, subtítulo y texto final. Si recibe onPress se vuelve presionable.
export function ListItem({
  title,
  subtitle,
  badge,
  trailing,
  onPress,
  destacado = false,
  enTarjeta = false,
  amplio = false,
}: ListItemProps) {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const content = (
    <>
      {badge != null && (
        <View style={styles.badge}>
          {typeof badge === "string" ? (
            <Text style={[typography.captionStrong, styles.ink]} numberOfLines={1}>
              {badge}
            </Text>
          ) : (
            withIconDefaults(badge, { color: colors.ink, size: sizes.iconGlyph })
          )}
        </View>
      )}
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, styles.ink]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle != null && (
          <Text style={[typography.caption, styles.muted]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {typeof trailing === "string" ? (
        <Text style={[typography.bodyStrong, styles.ink]} numberOfLines={1}>
          {trailing}
        </Text>
      ) : (
        trailing
      )}
    </>
  );

  if (!onPress) {
    return <View style={[styles.base, enTarjeta && styles.enTarjeta, enTarjeta && amplio && styles.amplio, destacado && styles.destacado]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        enTarjeta && styles.enTarjeta,
        enTarjeta && amplio && styles.amplio,
        destacado && styles.destacado,
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    base: {
      flexDirection: "row",
      alignItems: "center",
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
    enTarjeta: {
      paddingHorizontal: 0,
      paddingVertical: spacing.sm,
    },
    amplio: {
      paddingVertical: spacing.md,
    },
    badge: {
      width: sizes.badge,
      height: sizes.badge,
      borderRadius: radii.badge,
      backgroundColor: colors.canvas,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    text: {
      flex: 1,
      gap: spacing.xxs,
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
