import type { Linea, NivelTrafico, Ocupacion } from "@/types";

// Líneas de prueba sacadas de F1_06 / F1_07. Los valores marcados como
// "supuesto" no aparecen en Figma.
export const lineas: Linea[] = [
  {
    id: "la-50",
    codigo: "50",
    nombre: "La 50",
    tipo: "custer",
    empresa: "Empresa de Transportes 50 S.A.",
    tramo: "Ate – Surco",
    pasaje: 2.5,
    frecuenciaMin: 6,
    horario: "5am–11pm",
    recorridoIda: ["puente-nuevo", "los-angeles", "av-la-molina", "puente-primavera", "jockey-plaza", "angamos"],
    recorridoVuelta: ["angamos", "jockey-plaza", "puente-primavera", "av-la-molina", "los-angeles", "puente-nuevo"],
    afluencia: [25, 90, 100, 60, 40, 45, 90, 100, 35],
  },
  {
    id: "el-chosicano",
    codigo: "CH",
    nombre: "El Chosicano",
    tipo: "micro",
    empresa: "Transportes El Chosicano S.A.", // supuesto
    tramo: "Chosica – Callao",
    pasaje: 3,
    frecuenciaMin: 8, // supuesto
    horario: "4:30am–11pm", // supuesto
    recorridoIda: ["chosica", "vitarte", "puente-nuevo", "jockey-plaza", "centro-lima", "callao"],
    recorridoVuelta: ["callao", "centro-lima", "jockey-plaza", "puente-nuevo", "vitarte", "chosica"],
    afluencia: [40, 95, 85, 50, 45, 50, 85, 90, 30], // supuesto
  },
  {
    id: "anconero",
    codigo: "AN",
    nombre: "Anconero",
    tipo: "combi",
    empresa: "Empresa de Transportes Anconero S.A.", // supuesto
    tramo: "Ancón – Centro de Lima",
    pasaje: 2,
    frecuenciaMin: 15, // supuesto
    horario: "5am–10pm", // supuesto
    recorridoIda: ["ancon", "plaza-norte", "centro-lima", "puente-nuevo", "jockey-plaza"],
    recorridoVuelta: ["jockey-plaza", "puente-nuevo", "centro-lima", "plaza-norte", "ancon"],
    afluencia: [50, 100, 70, 40, 35, 40, 75, 80, 20], // supuesto
  },
  {
    id: "la-73",
    codigo: "73",
    nombre: "La 73",
    tipo: "combi",
    empresa: "Empresa de Transportes 73 S.A.", // supuesto
    tramo: "SJL – Surquillo",
    pasaje: 2.5, // supuesto
    frecuenciaMin: 5, // supuesto
    horario: "5am–11pm", // supuesto
    recorridoIda: ["proceres-sjl", "puente-nuevo", "centro-lima", "angamos"],
    recorridoVuelta: ["angamos", "centro-lima", "puente-nuevo", "proceres-sjl"],
    afluencia: [35, 100, 90, 55, 45, 50, 95, 85, 30], // supuesto
  },
  {
    id: "santa-cruz",
    codigo: "SC",
    nombre: "Santa Cruz",
    tipo: "micro",
    empresa: "Empresa de Transportes Santa Cruz S.A.", // supuesto
    tramo: "Vitarte – Miraflores",
    pasaje: 2.5, // supuesto
    frecuenciaMin: 10, // supuesto
    horario: "5am–11pm", // supuesto
    recorridoIda: ["vitarte", "los-angeles", "av-la-molina", "angamos", "ovalo-miraflores"],
    recorridoVuelta: ["ovalo-miraflores", "angamos", "av-la-molina", "los-angeles", "vitarte"],
    afluencia: [30, 85, 95, 60, 50, 55, 90, 95, 40], // supuesto
  },
];

// Líneas que sirven cada destino, con el estado de tráfico y conteo de
// reportes activos. En Supabase saldrá de una vista agregada.
export type RutaMock = {
  lineaId: string;
  etaMin: number;
  trafico: NivelTrafico;
  reportesActivos: number;
  ocupacion?: Ocupacion;
};

export const rutasPorDestino: Record<string, RutaMock[]> = {
  // F1_06: La 50 · 8 min · 12 reportes; El Chosicano · 14 min · 7 reportes; Anconero · ~20 min
  "jockey-plaza": [
    { lineaId: "anconero", etaMin: 20, trafico: "bajo", reportesActivos: 0 },
    { lineaId: "la-50", etaMin: 8, trafico: "medio", reportesActivos: 12, ocupacion: "sentados" },
    { lineaId: "el-chosicano", etaMin: 14, trafico: "alto", reportesActivos: 7, ocupacion: "lleno" },
  ],
  gamarra: [
    { lineaId: "la-73", etaMin: 11, trafico: "alto", reportesActivos: 4, ocupacion: "sopa" },
    { lineaId: "santa-cruz", etaMin: 16, trafico: "medio", reportesActivos: 2, ocupacion: "lleno" },
  ],
  "plaza-norte": [{ lineaId: "anconero", etaMin: 25, trafico: "medio", reportesActivos: 0 }],
  "centro-lima": [
    { lineaId: "la-73", etaMin: 9, trafico: "alto", reportesActivos: 4, ocupacion: "sopa" },
    { lineaId: "el-chosicano", etaMin: 14, trafico: "alto", reportesActivos: 7, ocupacion: "sentados" },
    { lineaId: "anconero", etaMin: 22, trafico: "medio", reportesActivos: 0 },
  ],
  chosica: [{ lineaId: "el-chosicano", etaMin: 18, trafico: "bajo", reportesActivos: 7, ocupacion: "sentados" }],
  ancon: [{ lineaId: "anconero", etaMin: 30, trafico: "bajo", reportesActivos: 0 }],
};
