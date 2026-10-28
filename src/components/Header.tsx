import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, opacity, spacing, typography } from "@/theme";

import { IconButton } from "./IconButton";

type HeaderProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  // Título en H2, para pantallas de detalle (F1_07)
  large?: boolean;
  // Reemplaza el botón atrás (p. ej. el indicador "a bordo" de F1_09)
  leading?: ReactNode;
  // Vuelve presionable el título (p. ej. para editar la vía en F2_06)
  onPressTitle?: () => void;
  titleHint?: string;
};

// Header con botón atrás. Va en la parte superior de la pantalla y respeta
// el borde seguro del celular (notch / barra de estado).
export function Header({
  title,
  eyebrow,
  subtitle,
  onBack,
  right,
  large = false,
  leading,
  onPressTitle,
  titleHint,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack =
    onBack ??
    (() => {
      if (router.canGoBack()) {
        router.back();
      }
    });

  const textos = (
    <>
      {eyebrow != null && (
        <Text style={[typography.overline, styles.muted]} numberOfLines={1}>
          {eyebrow}
        </Text>
      )}
      <Text style={[large ? typography.h2 : typography.title, styles.ink]} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      {subtitle != null && (
        <Text style={[typography.caption, styles.muted]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </>
  );

  return (
    <View style={[styles.base, { paddingTop: insets.top + spacing.sm }]}>
      {leading ?? <IconButton icon={<ArrowLeft />} onPress={handleBack} accessibilityLabel="Volver" />}
      {onPressTitle ? (
        <Pressable
          onPress={onPressTitle}
          accessibilityRole="button"
          accessibilityHint={titleHint}
          style={({ pressed }) => [styles.text, pressed && styles.pressed]}
        >
          {textos}
        </Pressable>
      ) : (
        <View style={styles.text}>{textos}</View>
      )}
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
});
