import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { usePreferencias } from "@/context/PreferenciasContext";
import {
  crearSombras,
  crearTipografia,
  paletaAltoContraste,
  paletaClara,
  paletaOscura,
  type ModoTema,
  type Tema,
} from "@/theme";

const TemaContext = createContext<Tema | null>(null);

// Tema activo (4.6): Sistema / Claro / Oscuro según Ajustes y el celular.
// Alto contraste (Accesibilidad) solo existe sobre el claro (Figma P1), así
// que tiene prioridad. El tamaño del texto escala toda la tipografía.
export function TemaProvider({ children }: { children: ReactNode }) {
  const { ajustes } = usePreferencias();
  const sistema = useColorScheme();

  const oscuro = ajustes.tema === "oscuro" || (ajustes.tema === "sistema" && sistema === "dark");
  const modo: ModoTema = ajustes.altoContraste ? "altoContraste" : oscuro ? "oscuro" : "claro";
  const escala = ajustes.escalaTexto;

  const tema = useMemo<Tema>(() => {
    const colors = modo === "altoContraste" ? paletaAltoContraste : modo === "oscuro" ? paletaOscura : paletaClara;
    return {
      colors,
      shadows: crearSombras(colors, modo),
      typography: crearTipografia(escala),
      modo,
      esquema: modo === "oscuro" ? "oscuro" : "claro",
      altoContraste: modo === "altoContraste",
    };
  }, [modo, escala]);

  return <TemaContext.Provider value={tema}>{children}</TemaContext.Provider>;
}

export function useTema(): Tema {
  const tema = useContext(TemaContext);
  if (!tema) {
    throw new Error("useTema debe usarse dentro de TemaProvider");
  }
  return tema;
}

// Estilos que dependen del tema: se crean una vez por tema activo.
// Uso: const crearEstilos = ({ colors }: Tema) => StyleSheet.create({...});
//      const styles = useEstilos(crearEstilos);
export function useEstilos<T>(crear: (tema: Tema) => T): T {
  const tema = useTema();
  return useMemo(() => crear(tema), [crear, tema]);
}
