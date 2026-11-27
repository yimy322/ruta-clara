import { useCallback } from "react";
import { Alert } from "react-native";

import { usePreferencias } from "@/context/PreferenciasContext";
import { useSesion } from "@/context/SesionContext";

// Pide confirmación antes de cerrar sesión (F3_07): cierra la sesión de
// Supabase, borra las preferencias del dispositivo y vuelve al onboarding
// (Stack.Protected); después del onboarding se pide el correo (/ingresar).
export function useCerrarSesion() {
  const { reiniciarOnboarding } = usePreferencias();
  const { cerrarSesion } = useSesion();

  return useCallback(() => {
    Alert.alert("¿Cerrar sesión?", "Tus ajustes de este celular se borrarán y verás de nuevo la bienvenida.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => void salir() },
    ]);

    async function salir() {
      await cerrarSesion();
      await reiniciarOnboarding();
    }
  }, [cerrarSesion, reiniciarOnboarding]);
}
