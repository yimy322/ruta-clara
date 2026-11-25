import type { Paleta } from "./colors";
import type { ModoTema, Sombras } from "./shadows";
import type { Tipografia } from "./typography";

export * from "./colors";
export * from "./typography";
export * from "./spacing";
export * from "./shadows";

// Tema activo (4.6): lo entrega useTema() de src/context/TemaContext.
// Los estilos se crean con una función (tema) => StyleSheet.create({...}) y
// el hook useEstilos(). spacing, radii, sizes, opacity y fonts no dependen
// del tema y se importan directo.
export type Tema = {
  colors: Paleta;
  shadows: Sombras;
  typography: Tipografia;
  modo: ModoTema;
  // Esquema efectivo, para la barra de estado
  esquema: "claro" | "oscuro";
  altoContraste: boolean;
};
