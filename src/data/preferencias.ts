// Preferencias locales del dispositivo (AsyncStorage). No pasan por el
// repositorio: no se sincronizan con Supabase.
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLAVES = {
  onboardingVisto: "rutaclara:onboardingVisto",
  ajustes: "rutaclara:ajustes",
} as const;

// Ajustes del usuario (F3_05, F3_06). Fase 5: las notificaciones se
// sincronizan con el perfil en Supabase.
export type Ajustes = {
  alertasRutas: boolean;
  seguridadCerca: boolean;
  logrosPuntos: boolean;
  ahorroDatos: boolean;
  // Solo se guarda por ahora: la búsqueda de rutas todavía no lo usa
  evitarZonasRojas: boolean;
};

// Valores de F3_05 y F3_06
export const AJUSTES_POR_DEFECTO: Ajustes = {
  alertasRutas: true,
  seguridadCerca: true,
  logrosPuntos: false,
  ahorroDatos: true,
  evitarZonasRojas: true,
};

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

export async function getAjustes(): Promise<Ajustes> {
  try {
    const guardado = await AsyncStorage.getItem(CLAVES.ajustes);
    // Se completan con los valores por defecto las claves que falten
    return { ...AJUSTES_POR_DEFECTO, ...(guardado ? (JSON.parse(guardado) as Partial<Ajustes>) : {}) };
  } catch {
    return AJUSTES_POR_DEFECTO;
  }
}

export async function setAjustes(ajustes: Ajustes): Promise<void> {
  await AsyncStorage.setItem(CLAVES.ajustes, JSON.stringify(ajustes));
}

// Borra únicamente las claves de la app (Cerrar sesión y datos de prueba)
export async function reiniciarPreferencias(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(CLAVES));
}
