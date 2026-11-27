// Insignias de F2_09 y cómo se obtienen. Figma solo muestra los nombres
// (y una bloqueada sin nombre): requisitos y reglas son supuestos.
import type { Insignia, Reporte } from "@/types";

type DefinicionInsignia = Omit<Insignia, "obtenida"> & {
  // true si los reportes propios cumplen el requisito
  cumple: (propios: Reporte[]) => boolean;
};

const hora = (reporte: Reporte) => new Date(reporte.creadoEn).getHours();

export const INSIGNIAS: DefinicionInsignia[] = [
  {
    id: "madrugador",
    nombre: "Madrugador",
    requisito: "Reporta 10 veces antes de las 7 AM.",
    cumple: (propios) => propios.filter((r) => hora(r) < 7).length >= 10,
  },
  {
    id: "ojo-de-halcon",
    nombre: "Ojo de halcón",
    requisito: "Logra que 50 de tus reportes sean confirmados.",
    // Confirmado = otro pasajero lo confirmó además de quien lo envió
    cumple: (propios) => propios.filter((r) => r.confirmaciones > 1).length >= 50,
  },
  {
    id: "vecino-seguro",
    nombre: "Vecino seguro",
    requisito: "Envía 5 reportes de seguridad.",
    cumple: (propios) => propios.filter((r) => r.tipo === "seguridad").length >= 5,
  },
  {
    id: "hora-punta",
    nombre: "Hora punta",
    requisito: "Reporta 20 veces entre 6 y 9 PM.",
    cumple: (propios) => propios.filter((r) => hora(r) >= 18 && hora(r) < 21).length >= 20,
  },
];
