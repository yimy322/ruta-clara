import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { colors, spacing } from "@/theme";

import { Button, type ButtonVariant } from "./Button";
import { Header } from "./Header";

export type PlaceholderAction = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
};

type PlaceholderScreenProps = {
  title: string;
  subtitle?: string;
  actions?: PlaceholderAction[];
  // Header ya cubre el borde superior; las tabs dejan el inferior a BottomNav.
  edges?: Edge[];
  children?: ReactNode;
};

// Pantalla PROVISIONAL de la fase 3: Header con el ID de Figma y botones
// para recorrer el camino feliz. Se reemplaza al maquetar cada pantalla.
export function PlaceholderScreen({
  title,
  subtitle,
  actions = [],
  edges = ["left", "right", "bottom"],
  children,
}: PlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      <Header title={title} subtitle={subtitle} />
      <View style={styles.content}>
        {actions.map((action) => (
          <Button
            key={action.label}
            label={action.label}
            onPress={action.onPress}
            variant={action.variant}
            fullWidth={action.variant !== "tertiary"}
          />
        ))}
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
});
