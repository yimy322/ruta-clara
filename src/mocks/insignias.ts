import type { Insignia } from "@/types";

// Insignias del usuario de prueba (F2_09). Figma solo muestra los nombres y
// una bloqueada sin nombre.
export const insignias: Insignia[] = [
  {
    id: "madrugador",
    nombre: "Madrugador",
    requisito: "Reporta 10 veces antes de las 7 AM.", // supuesto
    obtenida: true,
  },
  {
    id: "ojo-de-halcon",
    nombre: "Ojo de halcón",
    requisito: "Logra que 50 de tus reportes sean confirmados.", // supuesto
    obtenida: true,
  },
  {
    id: "vecino-seguro",
    nombre: "Vecino seguro",
    requisito: "Envía 5 reportes de seguridad.", // supuesto
    obtenida: true,
  },
  {
    id: "hora-punta",
    nombre: "Hora punta", // supuesto
    requisito: "Reporta 20 veces entre 6 y 9 PM.", // supuesto
    obtenida: false,
  },
];
