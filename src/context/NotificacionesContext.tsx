import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { contarNoLeidas } from "@/data/repositorio";

type NotificacionesContextValue = {
  noLeidas: number;
  // Vuelve a contar las no leídas; llamarla después de leer o crear avisos
  actualizarNoLeidas: () => Promise<void>;
};

const NotificacionesContext = createContext<NotificacionesContextValue | null>(null);

// Cantidad de avisos sin leer, para el punto de la tab Alertas (F3_04).
// Fase 5: se actualiza también al llegar avisos por Realtime / push.
export function NotificacionesProvider({ children }: { children: ReactNode }) {
  const [noLeidas, setNoLeidas] = useState(0);

  const actualizarNoLeidas = useCallback(async () => {
    setNoLeidas(await contarNoLeidas());
  }, []);

  useEffect(() => {
    let activo = true;
    contarNoLeidas().then((cantidad) => activo && setNoLeidas(cantidad));
    return () => {
      activo = false;
    };
  }, []);

  const value = useMemo(() => ({ noLeidas, actualizarNoLeidas }), [noLeidas, actualizarNoLeidas]);

  return <NotificacionesContext.Provider value={value}>{children}</NotificacionesContext.Provider>;
}

export function useNotificaciones() {
  const context = useContext(NotificacionesContext);
  if (!context) {
    throw new Error("useNotificaciones debe usarse dentro de NotificacionesProvider");
  }
  return context;
}
