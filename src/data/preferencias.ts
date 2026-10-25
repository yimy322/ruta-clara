// Preferencias locales del dispositivo (AsyncStorage). No pasan por el
// repositorio: no se sincronizan con Supabase.
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLAVES = {
  onboardingVisto: "rutaclara:onboardingVisto",
} as const;

export async function getOnboardingVisto(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVES.onboardingVisto)) === "1";
  } catch {
    // Si no se puede leer, se trata como primer uso
    return false;
  }
}

export async function setOnboardingVisto(valor: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVES.onboardingVisto, valor ? "1" : "0");
}

// Solo para desarrollo: borra únicamente las claves de la app
export async function reiniciarPreferencias(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(CLAVES));
}
