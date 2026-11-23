import { Bell, CircleAlert, CircleUser, House, Star, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { borderWidths, colors, opacity, radii, sizes, spacing, typography } from "@/theme";

export type BottomNavTab = "inicio" | "favoritos" | "reportar" | "alertas" | "perfil";

type BottomNavProps = {
  active: BottomNavTab;
  onSelect: (tab: BottomNavTab) => void;
  // Avisos pendientes por tab: con más de 0 se dibuja un punto rojo sobre el ícono
  badge?: Partial<Record<BottomNavTab, number>>;
};

const TABS: { key: BottomNavTab; label: string; Icon: LucideIcon }[] = [
  { key: "inicio", label: "Inicio", Icon: House },
  { key: "favoritos", label: "Favoritos", Icon: Star },
  { key: "reportar", label: "Reportar", Icon: CircleAlert },
  { key: "alertas", label: "Alertas", Icon: Bell },
  { key: "perfil", label: "Perfil", Icon: CircleUser },
];

// Navegación inferior de 5 ítems (Figma 73:1022). La pestaña activa lleva una
// píldora amarilla de 52 × 30 detrás del ícono. Es solo visual: (tabs)/_layout.tsx la
// conecta a las Tabs de Expo Router. Respeta el borde seguro inferior.
export function BottomNav({ active, onSelect, badge }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.base, { height: sizes.navHeight + insets.bottom, paddingBottom: sizes.navPaddingBottom + insets.bottom }]}
    >
      {TABS.map(({ key, label, Icon }) => {
        const selected = key === active;
        const pendientes = badge?.[key] ?? 0;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="tab"
            accessibilityLabel={pendientes > 0 ? `${label}, ${pendientes} sin leer` : label}
            accessibilityState={{ selected }}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View style={[styles.pill, selected && styles.pillActive]}>
              <Icon color={selected ? colors.ink : colors.inkMuted} size={sizes.navIcon} />
              {pendientes > 0 && <View style={styles.badge} />}
            </View>
            <Text
              style={selected ? [typography.captionStrong, styles.labelActive] : [typography.tab, styles.label]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: borderWidths.thin,
    borderTopColor: colors.line,
  },
  tab: {
    flex: 1,
    gap: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    width: sizes.navPill,
    height: sizes.navPillHeight,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: colors.yellow,
  },
  label: {
    color: colors.inkMuted,
  },
  labelActive: {
    color: colors.ink,
  },
  badge: {
    position: "absolute",
    top: 0,
    // Sobre la esquina del ícono de 22 centrado en la píldora de 52
    right: (sizes.navPill - sizes.navIcon) / 2 - sizes.badgeDot / 2,
    width: sizes.badgeDot,
    height: sizes.badgeDot,
    borderRadius: radii.pill,
    borderWidth: borderWidths.thin,
    borderColor: colors.surface,
    backgroundColor: colors.red,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
