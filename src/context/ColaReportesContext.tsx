import NetInfo from "@react-native-community/netinfo";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";

import { useToast } from "@/components";
import { encolar as guardarEnCola, enviarCola, getCola, type ReporteEnCola } from "@/data/colaReportes";
import type { BorradorReporte } from "@/types";

type ColaReportesContextValue = {
  cola: ReporteEnCola[];
  encolar: (borrador: BorradorReporte) => Promise<ReporteEnCola>;
  // Intenta enviar la cola ahora. true si quedó vacía
  reintentar: () => Promise<boolean>;
};

const ColaReportesContext = createContext<ColaReportesContextValue | null>(null);

// Reportes guardados sin conexión (E3). Se reenvían solos cuando vuelve la
// red (NetInfo) o la app vuelve a primer plano, y avisan con un toast.
export function ColaReportesProvider({ children }: { children: ReactNode }) {
  const { mostrar } = useToast();
  const [cola, setCola] = useState<ReporteEnCola[]>([]);
  // Evita dos envíos a la vez (p. ej. NetInfo y AppState juntos)
  const enviando = useRef(false);

  const reintentar = useCallback(async () => {
    if (enviando.current) {
      return false;
    }
    enviando.current = true;
    try {
      const enviados = await enviarCola();
      const pendientes = await getCola();
      setCola(pendientes);
      if (enviados.length > 0) {
        const puntos = enviados.reduce((suma, r) => suma + r.puntosGanados, 0);
        mostrar(
          enviados.length === 1
            ? `Tu reporte se envió · +${puntos} pts`
            : `Se enviaron ${enviados.length} reportes · +${puntos} pts`,
        );
      }
      return pendientes.length === 0;
    } finally {
      enviando.current = false;
    }
  }, [mostrar]);

  const encolar = useCallback(async (borrador: BorradorReporte) => {
    const item = await guardarEnCola(borrador);
    setCola(await getCola());
    return item;
  }, []);

  // Al abrir la app: carga la cola y, si hay algo, intenta enviarlo
  useEffect(() => {
    getCola().then((guardada) => {
      setCola(guardada);
      if (guardada.length > 0) {
        void reintentar();
      }
    });
  }, [reintentar]);

  // Vuelve la conexión o la app a primer plano: reintenta si hay pendientes
  useEffect(() => {
    if (cola.length === 0) {
      return;
    }
    const quitarRed = NetInfo.addEventListener((estado) => {
      if (estado.isConnected) {
        void reintentar();
      }
    });
    const sub = AppState.addEventListener("change", (estado) => {
      if (estado === "active") {
        void reintentar();
      }
    });
    return () => {
      quitarRed();
      sub.remove();
    };
  }, [cola.length, reintentar]);

  const value = useMemo(() => ({ cola, encolar, reintentar }), [cola, encolar, reintentar]);

  return <ColaReportesContext.Provider value={value}>{children}</ColaReportesContext.Provider>;
}

export function useColaReportes() {
  const context = useContext(ColaReportesContext);
  if (!context) {
    throw new Error("useColaReportes debe usarse dentro de ColaReportesProvider");
  }
  return context;
}
