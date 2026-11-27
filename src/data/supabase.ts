import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

// Cliente de Supabase (Fase 5). Único archivo que importa supabase-js:
// el resto de la app pasa por @/data/repositorio.
// Las variables salen de .env.local (no se sube a git). Son públicas: la
// contraseña de la base y la clave secreta nunca van en la app.
const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const CLAVE = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!URL || !CLAVE) {
  throw new Error(
    "Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local. Reinicia Expo después de crearlo.",
  );
}

export const supabase = createClient(URL, CLAVE, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Renueva la sesión solo con la app en primer plano
AppState.addEventListener("change", (estado) => {
  if (estado === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export type EstadoConexion = "conectado" | "sin-red" | "error";

// Chequeo de conexión para /dev/datos: pide la configuración pública de Auth.
export async function probarConexion(): Promise<EstadoConexion> {
  try {
    const respuesta = await fetch(`${URL}/auth/v1/settings`, { headers: { apikey: CLAVE! } });
    return respuesta.ok ? "conectado" : "error";
  } catch {
    // fetch solo lanza cuando no hay red o no se llega al servidor
    return "sin-red";
  }
}
