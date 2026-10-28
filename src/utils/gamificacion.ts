import { RANGOS } from "@/config/gamificacion";
import type { ProgresoRango } from "@/types";

// 1240 → Cazador de Combis, siguiente Rey del Paradero, faltan 260
export function calcularRango(puntos: number): ProgresoRango {
  const i = RANGOS.findLastIndex((rango) => puntos >= rango.puntosMinimos);
  const actual = RANGOS[Math.max(i, 0)];
  const siguiente = RANGOS[i + 1] ?? null;
  return {
    actual,
    siguiente,
    puntosFaltantes: siguiente ? siguiente.puntosMinimos - puntos : 0,
  };
}

// Avance en la escala de rangos de F2_09 (0–1). Cada rango ocupa el mismo
// tramo de la barra, así las etiquetas quedan al inicio, al centro y al final.
// 1240 → 0,74 (Cazador en 0,5 y faltan 260 de 500 para Rey del Paradero)
export function progresoEscala(puntos: number): number {
  const tramos = RANGOS.length - 1;
  const i = RANGOS.findLastIndex((rango) => puntos >= rango.puntosMinimos);
  if (i < 0) {
    return 0;
  }
  if (i >= tramos) {
    return 1;
  }
  const desde = RANGOS[i].puntosMinimos;
  const hasta = RANGOS[i + 1].puntosMinimos;
  return (i + (puntos - desde) / (hasta - desde)) / tramos;
}
