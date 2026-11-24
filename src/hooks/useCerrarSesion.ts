import { useCallback } from "react";
import { Alert } from "react-native";

import { usePreferencias } from "@/context/PreferenciasContext";

// Pide confirmación antes de cerrar sesión (F3_07). Por ahora borra las
// preferencias del dispositivo y vuelve al onboarding (Stack.Protected).
// Fase 5: también cierra la sesión de Supabase Auth.
export function useCerrarSesion() {
  const { reiniciarOnboarding } = usePreferencias();

  return useCallback(() => {
    Alert.alert("¿Cerrar sesión?", "Tus ajustes de este celular se borrarán y verás de nuevo la bienvenida.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => void reiniciarOnboarding() },
    ]);
  }, [reiniciarOnboarding]);
}
