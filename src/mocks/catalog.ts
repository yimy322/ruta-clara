// Datos de ejemplo para la pantalla temporal de catálogo de componentes.

export const catalogRoutes = [
  {
    id: "la-50",
    badge: "50",
    title: "La 50",
    subtitle: "Paradero Puente Nuevo · 3 reportes",
    trailing: "4 min",
  },
  {
    id: "el-chino",
    badge: "IO",
    title: "El Chino",
    subtitle: "Av. Abancay → Av. Javier Prado",
    trailing: "9 min",
  },
] as const;

export const catalogHeader = {
  eyebrow: "Ruta",
  title: "La 50",
  subtitle: "Paradero Puente Nuevo → Plaza San Miguel",
} as const;
