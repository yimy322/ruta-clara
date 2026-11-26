import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

import { usePreferencias } from "@/context/PreferenciasContext";

// true si hay que evitar animaciones: lo pidió el usuario en Accesibilidad
// (4.8) o lo tiene activado en el celular («Reducir movimiento»).
export function useReducirMovimiento(): boolean {
  const { ajustes } = usePreferencias();
  const [sistema, setSistema] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSistema);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setSistema);
    return () => sub.remove();
  }, []);

  return ajustes.reducirMovimiento || sistema;
}
