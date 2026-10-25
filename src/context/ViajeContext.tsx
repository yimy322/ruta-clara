import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { Linea, Paradero, Sentido, Viaje } from "@/types";

type ViajeContextValue = {
  // null cuando no hay viaje activo
  viaje: Viaje | null;
  iniciarEspera: (linea: Linea, paradero: Paradero, destino: string, sentido?: Sentido) => void;
  subir: () => void;
  avanzarParadero: () => void;
  finalizar: () => void;
  limpiar: () => void;
  setAvisarParaBajar: (valor: boolean) => void;
};

const ViajeContext = createContext<ViajeContextValue | null>(null);

// Ids de paraderos del sentido elegido; `paraderoActual` es un índice aquí
export const idsRecorrido = (viaje: Viaje) =>
  viaje.sentido === "ida" ? viaje.linea.recorridoIda : viaje.linea.recorridoVuelta;

// Estado del viaje activo, compartido por Detalle de ruta y las pantallas de
// viaje en vivo (F1_07 → F1_10). Vive solo en memoria.
export function ViajeProvider({ children }: { children: ReactNode }) {
  const [viaje, setViaje] = useState<Viaje | null>(null);

  const iniciarEspera = useCallback(
    (linea: Linea, paradero: Paradero, destino: string, sentido: Sentido = "ida") => {
      setViaje({
        linea,
        sentido,
        paraderoEspera: paradero,
        destino,
        estado: "esperando",
        inicioEn: new Date().toISOString(),
        paraderoActual: 0,
        // Activado por defecto, como en F1_09
        avisarParaBajar: true,
      });
    },
    [],
  );

  // Al subir, el viaje arranca en el paradero donde se esperó
  const subir = useCallback(() => {
    setViaje((actual) =>
      actual && {
        ...actual,
        estado: "a_bordo",
        paraderoActual: Math.max(idsRecorrido(actual).indexOf(actual.paraderoEspera.id), 0),
      },
    );
  }, []);

  const avanzarParadero = useCallback(() => {
    setViaje((actual) =>
      actual && {
        ...actual,
        paraderoActual: Math.min(actual.paraderoActual + 1, idsRecorrido(actual).length - 1),
      },
    );
  }, []);

  const finalizar = useCallback(() => {
    setViaje((actual) => actual && { ...actual, estado: "finalizado", finEn: new Date().toISOString() });
  }, []);

  const limpiar = useCallback(() => setViaje(null), []);

  const setAvisarParaBajar = useCallback((valor: boolean) => {
    setViaje((actual) => actual && { ...actual, avisarParaBajar: valor });
  }, []);

  const value = useMemo(
    () => ({ viaje, iniciarEspera, subir, avanzarParadero, finalizar, limpiar, setAvisarParaBajar }),
    [viaje, iniciarEspera, subir, avanzarParadero, finalizar, limpiar, setAvisarParaBajar],
  );

  return <ViajeContext.Provider value={value}>{children}</ViajeContext.Provider>;
}

export function useViaje() {
  const context = useContext(ViajeContext);
  if (!context) {
    throw new Error("useViaje debe usarse dentro de ViajeProvider");
  }
  return context;
}
