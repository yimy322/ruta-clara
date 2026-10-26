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
