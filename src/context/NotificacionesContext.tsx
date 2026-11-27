import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useSesion } from "@/context/SesionContext";
import { contarNoLeidas } from "@/data/repositorio";

type NotificacionesContextValue = {
  noLeidas: number;
  // Vuelve a contar las no leídas; llamarla después de leer o crear avisos
  actualizarNoLeidas: () => Promise<void>;
};

const NotificacionesContext = createContext<NotificacionesContextValue | null>(null);

// Cantidad de avisos sin leer, para el punto de la tab Alertas (F3_04).
// Se cuenta al entrar a la app (con sesión) y vuelve a 0 al cerrar sesión.
// Pendiente: actualizar también al llegar avisos por Realtime / push.
export function NotificacionesProvider({ children }: { children: ReactNode }) {
  const [noLeidas, setNoLeidas] = useState(0);
  const { estado } = useSesion();
  const enLaApp = estado === "lista";

  const actualizarNoLeidas = useCallback(async () => {
    try {
      setNoLeidas(await contarNoLeidas());
    } catch {
      // Sin red se mantiene el último conteo
    }
  }, []);

  useEffect(() => {
    if (!enLaApp) {
      return;
    }
    let activo = true;
    contarNoLeidas()
      .then((cantidad) => activo && setNoLeidas(cantidad))
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [enLaApp]);

  // Sin sesión no hay avisos que mostrar
  const visibles = enLaApp ? noLeidas : 0;
  const value = useMemo(() => ({ noLeidas: visibles, actualizarNoLeidas }), [visibles, actualizarNoLeidas]);

  return <NotificacionesContext.Provider value={value}>{children}</NotificacionesContext.Provider>;
}

export function useNotificaciones() {
  const context = useContext(NotificacionesContext);
  if (!context) {
    throw new Error("useNotificaciones debe usarse dentro de NotificacionesProvider");
  }
  return context;
}
