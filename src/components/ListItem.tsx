import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { borderWidths, colors, opacity, radii, sizes, spacing, typography } from "@/theme";
import { withIconDefaults } from "@/utils/icons";

type ListItemProps = {
  title: string;
  subtitle?: string;
  badge?: string | ReactNode;
  trailing?: string | ReactNode;
  onPress?: () => void;
};

// Fila de lista: badge (número de ruta o ícono), título, subtítulo y texto
// final. Si recibe onPress se vuelve presionable.
export function ListItem({ title, subtitle, badge, trailing, onPress }: ListItemProps) {
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
    return <View style={styles.base}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: borderWidths.hairline,
    borderBottomColor: colors.line,
  },
  badge: {
    width: sizes.badge,
    height: sizes.badge,
    borderRadius: radii.md,
    borderWidth: borderWidths.strong,
    borderColor: colors.ink,
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
