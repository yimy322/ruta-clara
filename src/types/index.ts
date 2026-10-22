// Tipos del dominio. Se comparten entre mocks, repositorio y pantallas.

export type TipoUnidad = "combi" | "custer" | "micro";

export type Ocupacion = "sentados" | "lleno" | "sopa";

export type Velocidad = "normal" | "lento" | "chanteando";

export type NivelTrafico = "bajo" | "medio" | "alto";

export type Paradero = {
  id: string;
  nombre: string;
  direccion: string;
  distrito: string;
  lat: number;
  lng: number;
};

export type Linea = {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoUnidad;
  empresa: string;
  tramo: string;
  pasaje: number;
  frecuenciaMin: number;
  horario: string;
  // Ids de paraderos en orden de recorrido
  recorridoIda: string[];
  recorridoVuelta: string[];
  // 9 valores (0–100) de 6am a 10pm, cada 2 h, para el gráfico de afluencia
  afluencia: number[];
};

export type TipoReporte = "ubicacion" | "paradero" | "transito" | "seguridad" | "desvio";

export type Reporte = {
  id: string;
  tipo: TipoReporte;
  lineaId?: string;
  paraderoId?: string;
  lat: number;
  lng: number;
  ocupacion?: Ocupacion;
  velocidad?: Velocidad;
  nota?: string;
  // Fecha ISO
  creadoEn: string;
  confirmaciones: number;
};

// Resultado de búsqueda (F1_06)
export type OpcionRuta = {
  linea: Linea;
  etaMin: number;
  trafico: NivelTrafico;
  ocupacion?: Ocupacion;
  reportesActivos: number;
  // null cuando no hay reportes (estimado)
  ultimoReporteMin: number | null;
  // true si no hay reportes y el ETA sale del horario
  estimado: boolean;
};

export type Destino = {
  id: string;
  nombre: string;
  distrito: string;
  lat: number;
  lng: number;
};

export type LugarGuardado = {
  id: string;
  nombre: "Casa" | "Trabajo" | "U";
  direccion: string;
  lat: number;
  lng: number;
};
