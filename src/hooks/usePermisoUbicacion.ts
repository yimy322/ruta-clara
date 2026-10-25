import * as Location from "expo-location";
import { useEffect } from "react";
import { AppState, Linking } from "react-native";

// Estado del permiso de ubicación en primer plano. Se vuelve a revisar cada
// vez que la app regresa a primer plano (p. ej., al volver de los ajustes).
export function usePermisoUbicacion() {
  const [permiso, pedir, revisar] = Location.useForegroundPermissions();

  useEffect(() => {
    const suscripcion = AppState.addEventListener("change", (estado) => {
      if (estado === "active") {
        revisar();
      }
    });
    return () => suscripcion.remove();
  }, [revisar]);

  // Mientras no se lee el permiso se asume concedido, para que el banner no parpadee
  const concedido = permiso?.granted ?? true;
  const puedePedir = permiso?.canAskAgain ?? true;

  const activar = async () => {
    if (puedePedir) {
      await pedir();
      return;
    }
    try {
      await Linking.openSettings();
    } catch {
      // Sin ajustes del sistema (web)
    }
  };

  return { concedido, puedePedir, activar };
}
