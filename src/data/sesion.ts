// Inicio de sesión con código por correo (Supabase Auth, OTP). Separado del
// repositorio como preferencias.ts: la sesión vive en el contexto
// SesionContext y las pantallas la usan con useSesion().
import { SinConexionError } from "./simulacion";
import { supabase } from "./supabase";

export type DatosSesion = {
  usuarioId: string;
  correo: string;
};

// codigo = incorrecto o vencido; limite = se pidieron demasiados códigos
export type MotivoErrorSesion = "codigo" | "limite" | "otro";

export class ErrorSesion extends Error {
  constructor(public motivo: MotivoErrorSesion) {
    super(`Error de sesión: ${motivo}`);
    this.name = "ErrorSesion";
  }
}

type ErrorAuth = { name?: string; code?: string; status?: number; message?: string };

// Traduce los errores de supabase-js (sin importar sus clases)
function traducir(error: ErrorAuth): Error {
  // PostgREST sin red: { code: "", message: "TypeError: Network request failed" }
  const sinRed = /network request failed|failed to fetch/i.test(error.message ?? "");
  if (error.name === "AuthRetryableFetchError" || error.status === 0 || sinRed) {
    return new SinConexionError();
  }
  if (error.code === "otp_expired") {
    return new ErrorSesion("codigo");
  }
  if (error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit" || error.status === 429) {
    return new ErrorSesion("limite");
  }
  return new ErrorSesion("otro");
}

// Texto del toast cuando no se pudo enviar (o reenviar) el código
export function mensajeErrorEnvio(error: unknown) {
  if (error instanceof SinConexionError) return "Sin conexión. Revisa tu internet e inténtalo de nuevo.";
  if (error instanceof ErrorSesion && error.motivo === "limite") return "Pediste muchos códigos. Espera unos minutos.";
  return "No pudimos enviar el código. Inténtalo de nuevo.";
}

// fetch lanza TypeError sin red; los demás errores llegan en { error }
async function llamar<T extends { error: ErrorAuth | null }>(peticion: () => Promise<T>): Promise<T> {
  let respuesta: T;
  try {
    respuesta = await peticion();
  } catch {
    throw new SinConexionError();
  }
  if (respuesta.error) {
    throw traducir(respuesta.error);
  }
  return respuesta;
}

// Envía el código de 6 dígitos. Si el correo es nuevo, crea la cuenta (y el
// trigger crear_perfil, su perfil).
export async function enviarCodigo(correo: string): Promise<void> {
  await llamar(() => supabase.auth.signInWithOtp({ email: correo, options: { shouldCreateUser: true } }));
}

// Si el código es correcto, Supabase guarda la sesión y escucharSesion avisa
export async function verificarCodigo(correo: string, codigo: string): Promise<void> {
  await llamar(() => supabase.auth.verifyOtp({ email: correo, token: codigo, type: "email" }));
}

// Sin red igual borra la sesión del teléfono (scope local)
export async function cerrarSesionRemota(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      await supabase.auth.signOut({ scope: "local" });
    }
  } catch {
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  }
}

// Avisa la sesión actual (incluida la guardada en el teléfono) y cada cambio.
// Devuelve la función para dejar de escuchar.
export function escucharSesion(alCambiar: (sesion: DatosSesion | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
    alCambiar(sesion ? { usuarioId: sesion.user.id, correo: sesion.user.email ?? "" } : null);
  });
  return () => data.subscription.unsubscribe();
}

// Nombre del perfil ("" si todavía no lo eligió)
export async function getNombrePerfil(usuarioId: string): Promise<string> {
  const { data } = await llamar(async () => await supabase.from("perfiles").select("nombre").eq("id", usuarioId).single());
  return (data as { nombre: string } | null)?.nombre ?? "";
}

export async function guardarNombre(usuarioId: string, nombre: string): Promise<void> {
  await llamar(async () => await supabase.from("perfiles").update({ nombre }).eq("id", usuarioId));
}
