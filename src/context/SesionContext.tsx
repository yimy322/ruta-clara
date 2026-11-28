import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { cancelarTodosLosAvisos } from "@/data/repositorio";
import { cerrarSesionRemota, escucharSesion, prepararPerfil, type DatosSesion } from "@/data/sesion";

// cargando = leyendo la sesión guardada o el nombre del perfil;
// sin-nombre = primera vez, falta «¿Cómo te llamas?» (/ingresar/nombre)
export type EstadoSesion = "cargando" | "sin-sesion" | "sin-nombre" | "lista";

type SesionContextValue = {
  estado: EstadoSesion;
  sesion: DatosSesion | null;
  cerrarSesion: () => Promise<void>;
  // /ingresar/nombre avisa que ya guardó el nombre
  nombreGuardado: () => void;
};

const SesionContext = createContext<SesionContextValue | null>(null);

// Sesión de Supabase Auth para las rutas protegidas del layout raíz
export function SesionProvider({ children }: { children: ReactNode }) {
  // undefined = todavía no se leyó la sesión guardada
  const [sesion, setSesion] = useState<DatosSesion | null>();
  // Resultado de leer el nombre del perfil, por usuario
  const [perfil, setPerfil] = useState<{ usuarioId: string; conNombre: boolean } | null>(null);

  useEffect(() => escucharSesion(setSesion), []);

  const usuarioId = sesion?.usuarioId;

  // Fuera del callback de onAuthStateChange: Supabase no permite llamarse
  // a sí mismo dentro de él
  useEffect(() => {
    if (!usuarioId) return;
    let activo = true;
    prepararPerfil(usuarioId)
      .then((nombre) => activo && setPerfil({ usuarioId, conNombre: nombre.trim().length > 0 }))
      // Sin red no se bloquea a quien ya había entrado
      .catch(() => activo && setPerfil({ usuarioId, conNombre: true }));
    return () => {
      activo = false;
    };
  }, [usuarioId]);

  const estado: EstadoSesion =
    sesion === undefined
      ? "cargando"
      : sesion === null
        ? "sin-sesion"
        : perfil?.usuarioId !== sesion.usuarioId
          ? "cargando"
          : perfil.conNombre
            ? "lista"
            : "sin-nombre";

  const cerrarSesion = useCallback(async () => {
    await cerrarSesionRemota();
    // No deben llegar avisos de la cuenta que se cerró
    await cancelarTodosLosAvisos();
    setPerfil(null);
  }, []);

  const nombreGuardado = useCallback(() => {
    if (usuarioId) setPerfil({ usuarioId, conNombre: true });
  }, [usuarioId]);

  const value = useMemo(
    () => ({ estado, sesion: sesion ?? null, cerrarSesion, nombreGuardado }),
    [estado, sesion, cerrarSesion, nombreGuardado],
  );

  return <SesionContext.Provider value={value}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  const context = useContext(SesionContext);
  if (!context) {
    throw new Error("useSesion debe usarse dentro de SesionProvider");
  }
  return context;
}
