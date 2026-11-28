import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  AJUSTES_POR_DEFECTO,
  getAjustes,
  getOnboardingVisto,
  reiniciarPreferencias,
  setAjustes,
  setOnboardingVisto,
  type Ajustes,
} from "@/data/preferencias";
import { sincronizarRecordatorios } from "@/data/repositorio";

// Duración mínima de la pantalla de carga, para que no parpadee
const CARGA_MINIMA_MS = 1500;

type PreferenciasContextValue = {
  // null mientras se lee del dispositivo
  onboardingVisto: boolean | null;
  completarOnboarding: () => Promise<void>;
  reiniciarOnboarding: () => Promise<void>;
  // Ajustes de F3_05 y F3_06; se guardan en el dispositivo al cambiarlos
  ajustes: Ajustes;
  cambiarAjuste: <K extends keyof Ajustes>(clave: K, valor: Ajustes[K]) => void;
};

const PreferenciasContext = createContext<PreferenciasContextValue | null>(null);

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Preferencias locales compartidas por el layout raíz (rutas protegidas),
// el onboarding, Perfil, Ajustes y el mapa de seguridad.
export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [onboardingVisto, setVisto] = useState<boolean | null>(null);
  const [ajustes, setEstadoAjustes] = useState<Ajustes>(AJUSTES_POR_DEFECTO);

  useEffect(() => {
    let activo = true;
    Promise.all([getOnboardingVisto(), getAjustes(), esperar(CARGA_MINIMA_MS)]).then(([visto, guardados]) => {
      if (!activo) return;
      setEstadoAjustes(guardados);
      setVisto(visto);
    });
    return () => {
      activo = false;
    };
  }, []);

  const completarOnboarding = useCallback(async () => {
    await setOnboardingVisto(true);
    setVisto(true);
  }, []);

  const reiniciarOnboarding = useCallback(async () => {
    await reiniciarPreferencias();
    setEstadoAjustes(AJUSTES_POR_DEFECTO);
    setVisto(false);
  }, []);

  // Se actualiza en pantalla al instante; si no se puede guardar, el cambio
  // dura hasta cerrar la app
  const cambiarAjuste = useCallback(<K extends keyof Ajustes>(clave: K, valor: Ajustes[K]) => {
    setEstadoAjustes((anteriores) => {
      const nuevos = { ...anteriores, [clave]: valor };
      setAjustes(nuevos).catch(() => {});
      return nuevos;
    });
    // «Alertas de rutas» enciende o apaga los recordatorios locales (6.3)
    if (clave === "alertasRutas") {
      void sincronizarRecordatorios(valor as boolean);
    }
  }, []);

  const value = useMemo(
    () => ({ onboardingVisto, completarOnboarding, reiniciarOnboarding, ajustes, cambiarAjuste }),
    [onboardingVisto, completarOnboarding, reiniciarOnboarding, ajustes, cambiarAjuste],
  );

  return <PreferenciasContext.Provider value={value}>{children}</PreferenciasContext.Provider>;
}

export function usePreferencias() {
  const context = useContext(PreferenciasContext);
  if (!context) {
    throw new Error("usePreferencias debe usarse dentro de PreferenciasProvider");
  }
  return context;
}
