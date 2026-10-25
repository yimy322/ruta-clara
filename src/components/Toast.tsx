import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radii, sizes, spacing, typography } from "@/theme";

const DURACION_MS = 2500;
const ANIMACION_MS = 200;

type ToastContextValue = {
  mostrar: (mensaje: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

// Mensaje breve abajo de la pantalla que desaparece solo a los 2,5 s. Se
// ubica por encima de la barra inferior y de los botones fijos. Un mensaje
// nuevo reemplaza al anterior y reinicia el tiempo.
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [visibilidad] = useState(() => new Animated.Value(0));
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  const mostrar = useCallback(
    (texto: string) => {
      clearTimeout(temporizador.current);
      setMensaje(texto);
      Animated.timing(visibilidad, { toValue: 1, duration: ANIMACION_MS, useNativeDriver: true }).start();
      temporizador.current = setTimeout(() => {
        Animated.timing(visibilidad, { toValue: 0, duration: ANIMACION_MS, useNativeDriver: true }).start(
          ({ finished }) => finished && setMensaje(null),
        );
      }, DURACION_MS);
    },
    [visibilidad],
  );

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const value = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mensaje != null && (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={[styles.base, { bottom: insets.bottom + sizes.navHeight + spacing.lg, opacity: visibilidad }]}
        >
          <Text style={[typography.bodyStrong, styles.texto]}>{mensaje}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  base: {
    position: "absolute",
    alignSelf: "center",
    maxWidth: "90%",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
  },
  texto: {
    color: colors.surface,
    textAlign: "center",
  },
});
