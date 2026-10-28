import type { Via } from "@/types";

// Vías para detectar dónde se reporta el tránsito (F2_06). Coordenadas
// aproximadas de un punto de la vía a la altura indicada.
export const vias: Via[] = [
  {
    id: "evitamiento-ate",
    nombre: "Vía Evitamiento",
    referencia: "altura Ate",
    // supuesto: junto al Paradero Puente Nuevo, cerca del usuario de prueba
    lat: -12.0448,
    lng: -76.9975,
  },
  {
    id: "javier-prado-la-molina", // supuesto
    nombre: "Av. Javier Prado Este",
    referencia: "altura La Molina",
    lat: -12.0768,
    lng: -76.9535,
  },
  {
    id: "panamericana-sur-primavera", // supuesto
    nombre: "Panamericana Sur",
    referencia: "altura Primavera",
    lat: -12.1093,
    lng: -76.9832,
  },
  {
    id: "carretera-central-vitarte", // supuesto
    nombre: "Carretera Central",
    referencia: "altura Vitarte",
    lat: -12.0283,
    lng: -76.9312,
  },
];
