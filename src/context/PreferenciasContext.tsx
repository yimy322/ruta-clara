import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getOnboardingVisto, reiniciarPreferencias, setOnboardingVisto } from "@/data/preferencias";

// Duración mínima de la pantalla de carga, para que no parpadee
const CARGA_MINIMA_MS = 1500;

type PreferenciasContextValue = {
  // null mientras se lee del dispositivo
  onboardingVisto: boolean | null;
  completarOnboarding: () => Promise<void>;
  reiniciarOnboarding: () => Promise<void>;
};

const PreferenciasContext = createContext<PreferenciasContextValue | null>(null);

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Preferencias locales compartidas por el layout raíz (rutas protegidas),
// el onboarding y Perfil.
export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [onboardingVisto, setVisto] = useState<boolean | null>(null);

  useEffect(() => {
    let activo = true;
    Promise.all([getOnboardingVisto(), esperar(CARGA_MINIMA_MS)]).then(([visto]) => {
      if (activo) setVisto(visto);
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
    setVisto(false);
  }, []);

  const value = useMemo(
    () => ({ onboardingVisto, completarOnboarding, reiniciarOnboarding }),
    [onboardingVisto, completarOnboarding, reiniciarOnboarding],
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
