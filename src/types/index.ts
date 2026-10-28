// Tipos del dominio. Se comparten entre mocks, repositorio y pantallas.

export type TipoUnidad = "combi" | "custer" | "micro";

export type Ocupacion = "sentados" | "lleno" | "sopa";

export type Velocidad = "normal" | "lento" | "chanteando";

export type NivelTrafico = "bajo" | "medio" | "alto";

// Cuánto lleva esperando quien reporta un paradero (F2_05)
export type TiempoEspera = "5_10" | "15_20" | "mas_30";

// Nivel de congestión de un reporte de tránsito (F2_06)
export type NivelCongestion = "fluido" | "moderado" | "pesado" | "trancadera";

export type CausaTransito = "obras" | "choque" | "semaforo" | "marcha" | "fiscalizacion" | "inundacion";

// Qué pasó, en un reporte de seguridad (F2_07)
export type TipoSeguridad = "paradero_peligroso" | "robo" | "acoso" | "conductor_imprudente";

// Vía (avenida, carretera) donde se reporta el tránsito; se muestra como
// "Vía Evitamiento · altura Ate"
export type Via = {
  id: string;
  nombre: string;
  referencia: string;
  lat: number;
  lng: number;
};

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

export type TipoReporte = "ubicacion" | "paradero" | "transito" | "seguridad" | "desvio" | "valoracion";

export type Reporte = {
  id: string;
  tipo: TipoReporte;
  // Quién lo envió. Falta en los reportes de otros pasajeros y, al leerlos
  // de otros, en los anónimos
  usuarioId?: string;
  lineaId?: string;
  paraderoId?: string;
  lat: number;
  lng: number;
  ocupacion?: Ocupacion;
  velocidad?: Velocidad;
  nota?: string;
  // 1–5, solo en valoraciones (F1_10)
  valoracion?: number;
  etiquetas?: string[];
  // Reporte de paradero (F2_05)
  espera?: TiempoEspera;
  // Reporte de tránsito (F2_06)
  congestion?: NivelCongestion;
  causas?: CausaTransito[];
  via?: string;
  // Reporte de seguridad (F2_07). Urgente = se mantuvo presionado ALERTA URGENTE
  seguridad?: TipoSeguridad;
  urgente?: boolean;
  anonimo?: boolean;
  // URI local de la foto. Fase 5: URL en Supabase Storage
  fotoUri?: string;
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

export type Coordenada = {
  lat: number;
  lng: number;
};

// Unidad en vivo en el mapa (F1_04), según el último reporte de ubicación
export type UnidadEnVivo = {
  linea: Linea;
  lat: number;
  lng: number;
};

// Estado de un paradero según sus reportes vigentes (card de F1_04)
export type ResumenParadero = {
  reportesActivos: number;
  // Fecha ISO del reporte más reciente; null si no hay reportes vigentes
  ultimoReporte: string | null;
  ocupacion?: Ocupacion;
};

export type Sentido = "ida" | "vuelta";

export type EstadoViaje = "esperando" | "a_bordo" | "finalizado";

// Viaje activo del usuario (F1_08–F1_10)
export type Viaje = {
  linea: Linea;
  sentido: Sentido;
  paraderoEspera: Paradero;
  destino: string;
  estado: EstadoViaje;
  // Fecha ISO
  inicioEn: string;
  // Índice en el recorrido del sentido elegido
  paraderoActual: number;
  avisarParaBajar: boolean;
  // Fecha ISO; se llena al finalizar el viaje
  finEn?: string;
};

// Unidad que se acerca al paradero de espera (F1_08), según su último
// reporte de ubicación
export type UnidadEnCamino = {
  linea: Linea;
  lat: number;
  lng: number;
  distanciaM: number;
  etaMin: number;
  ocupacion?: Ocupacion;
  velocidad?: Velocidad;
  // Pasajeros que confirmaron la ubicación
  pasajeros: number;
  // Fecha ISO del reporte
  actualizadoEn: string;
};

// Paradero del tramo de viaje, con los minutos estimados desde el paradero
// de espera (F1_09)
export type ParaderoTramo = {
  paradero: Paradero;
  minutos: number;
};

export type Usuario = {
  id: string;
  nombre: string;
  puntos: number;
  reportesMes: number;
  // 0–100: reportes del mes que otros pasajeros confirmaron
  porcentajeConfirmados: number;
};

export type Rango = {
  nombre: string;
  // En la escala de rangos de F2_09 ("Cazador")
  nombreCorto: string;
  puntosMinimos: number;
};

// Rango del usuario según sus puntos (F2_09)
export type ProgresoRango = {
  actual: Rango;
  // null en el rango más alto
  siguiente: Rango | null;
  puntosFaltantes: number;
};

// Ubicación de una unidad o desvío de su ruta: comparten el paso de elegir línea
export type ModoReporte = "ubicacion" | "desvio";

// Dónde está quien reporta respecto a la unidad
export type EnUnidad = "a_bordo" | "paradero";

// Reporte en armado a lo largo de los pasos del Flujo 2 (F2_01–F2_08)
export type BorradorReporte = {
  tipo?: TipoReporte;
  modo: ModoReporte;
  lineaId?: string;
  enUnidad?: EnUnidad;
  // En F2_05 guarda el estado del paradero: Tranquilo = sentados, Lleno =
  // lleno, Desbordado = sopa
  ocupacion?: Ocupacion;
  velocidad?: Velocidad;
  // Punto marcado en el mapa; si falta, se usa la ubicación del usuario
  posicion?: Coordenada;
  compartirEnVivo: boolean;
  // Valoración del viaje (F1_10)
  valoracion?: number;
  etiquetas?: string[];
  // Paradero elegido (F2_05); si falta, se usa el más cercano a la posición
  paraderoId?: string;
  espera?: TiempoEspera;
  congestion?: NivelCongestion;
  causas?: CausaTransito[];
  via?: string;
  seguridad?: TipoSeguridad;
  urgente?: boolean;
  // Si falta, la alerta es anónima
  anonimo?: boolean;
  nota?: string;
  fotoUri?: string;
};

// Línea para elegir al reportar (F2_02)
export type LineaSugerida = {
  linea: Linea;
  // Distancia al paradero más cercano de su recorrido
  distanciaM: number;
  // Reportes de hoy sobre la línea, contando confirmaciones
  reportesHoy: number;
};

export type ResultadoReporte = {
  reporte: Reporte;
  puntosGanados: number;
  // Usuario con los puntos ya sumados
  usuario: Usuario;
  personasQueLoVen: number;
};

// Logro del usuario (F2_09)
export type Insignia = {
  id: string;
  nombre: string;
  requisito: string;
  obtenida: boolean;
};

// Reporte propio en el historial (F2_09)
export type ReporteHistorial = {
  reporte: Reporte;
  linea?: Linea;
  puntos: number;
  // Ya no cuenta como activo
  vencido: boolean;
};
