import type { Coordenada, Usuario } from "@/types";

// supuesto: ubicación fija del usuario, ~180 m al sur del Paradero Puente
// Nuevo (F1_04 muestra "Cerca de ti · 180 m").
export const ubicacionUsuario: Coordenada = { lat: -12.0452, lng: -76.9988 };

// Usuario de prueba (F2_09)
export const usuario: Usuario = {
  id: "u1", // supuesto
  nombre: "Rosa M.",
  puntos: 1240,
  reportesMes: 47,
  porcentajeConfirmados: 92,
};
