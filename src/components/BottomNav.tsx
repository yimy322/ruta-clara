import { BellPlus, CircleAlert, CircleUser, House, Star, type LucideIcon } from "lucide-react-native";
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
  { key: "alertas", label: "Alertas", Icon: BellPlus },
  { key: "perfil", label: "Perfil", Icon: CircleUser },
];

// Navegación inferior de 5 ítems. Es solo visual: (tabs)/_layout.tsx la
// conecta a las Tabs de Expo Router. Respeta el borde seguro inferior.
export function BottomNav({ active, onSelect, badge }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.base, { height: sizes.navHeight + insets.bottom, paddingBottom: spacing.sm + insets.bottom }]}
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
            style={({ pressed }) => [styles.tab, selected && styles.tabActive, pressed && styles.pressed]}
          >
            <View>
              <Icon color={colors.ink} size={sizes.navIcon} />
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
  tabActive: {
    backgroundColor: colors.line,
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
    right: 0,
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
