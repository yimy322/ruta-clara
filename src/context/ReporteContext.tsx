import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { BorradorReporte } from "@/types";

type ReporteContextValue = {
  borrador: BorradorReporte;
  actualizar: (cambios: Partial<BorradorReporte>) => void;
  reiniciar: () => void;
  // Cierra el modal de reporte desde cualquier paso
  cerrar: () => void;
};

const ReporteContext = createContext<ReporteContextValue | null>(null);

const BORRADOR_INICIAL: BorradorReporte = {
  modo: "ubicacion",
  compartirEnVivo: false, // supuesto
};

// Reporte en armado, compartido por los pasos del modal /reporte (F2_01–F2_08).
// Vive mientras el modal está abierto.
export function ReporteProvider({ children, onCerrar }: { children: ReactNode; onCerrar: () => void }) {
  const [borrador, setBorrador] = useState<BorradorReporte>(BORRADOR_INICIAL);

  const actualizar = useCallback((cambios: Partial<BorradorReporte>) => {
    setBorrador((actual) => ({ ...actual, ...cambios }));
  }, []);

  const reiniciar = useCallback(() => setBorrador(BORRADOR_INICIAL), []);

  const value = useMemo(
    () => ({ borrador, actualizar, reiniciar, cerrar: onCerrar }),
    [borrador, actualizar, reiniciar, onCerrar],
  );

  return <ReporteContext.Provider value={value}>{children}</ReporteContext.Provider>;
}

export function useReporte() {
  const context = useContext(ReporteContext);
  if (!context) {
    throw new Error("useReporte debe usarse dentro de ReporteProvider");
  }
  return context;
}
