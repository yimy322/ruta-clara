import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

import { SinConexionError } from "./simulacion";

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

// Vuelve a fechar los reportes de ejemplo para que la demo siga «en vivo»
// (función refrescar_demo de supabase/migrations/003). Devuelve cuántos
// reportes actualizó.
export async function refrescarDemo(): Promise<number> {
  const { data, error } = await supabase.rpc("refrescar_demo");
  if (error) {
    throw new Error(error.message);
  }
  return data as number;
}

const TIPOS_FOTO: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", heic: "image/heic" };

// Sube la foto de un reporte a Storage (bucket fotos-reportes, carpeta del
// usuario; 006_fotos_y_borrado.sql) y devuelve su URL pública. Sin red lanza
// SinConexionError; si el archivo no se puede leer o subir, Error.
export async function subirFotoReporte(usuarioId: string, uri: string): Promise<string> {
  const extension = uri.split("?")[0].split(".").pop()?.toLowerCase() ?? "jpg";
  const contentType = TIPOS_FOTO[extension] ?? "image/jpeg";

  // Archivo local: si no existe, fetch falla y es un error del archivo, no de la red
  let contenido: ArrayBuffer;
  try {
    contenido = await (await fetch(uri)).arrayBuffer();
  } catch {
    throw new Error("No se pudo leer la foto");
  }

  const ruta = `${usuarioId}/${Date.now()}.${extension in TIPOS_FOTO ? extension : "jpg"}`;
  let resultado: Awaited<ReturnType<ReturnType<typeof supabase.storage.from>["upload"]>>;
  try {
    resultado = await supabase.storage.from("fotos-reportes").upload(ruta, contenido, { contentType });
  } catch {
    throw new SinConexionError();
  }
  if (resultado.error) {
    const sinRed = /network request failed|failed to fetch/i.test(resultado.error.message);
    throw sinRed ? new SinConexionError() : new Error(resultado.error.message);
  }
  return supabase.storage.from("fotos-reportes").getPublicUrl(ruta).data.publicUrl;
}
