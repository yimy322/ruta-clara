// Capa de acceso a datos. Las pantallas solo leen datos desde aquí.
// Fase 5: se reemplaza por consultas a Supabase sin cambiar las firmas.
import { PUNTOS_POR_TIPO } from "@/config/gamificacion";
import { INSIGNIAS } from "@/config/insignias";
import { UMBRAL_EN_VIVO_MIN, UMBRAL_ZONA_ALTA, VENTANA_PARADERO_H, VIGENCIA_REPORTE_MIN } from "@/config/reportes";
import { VELOCIDAD_MEDIA_KMH } from "@/config/simulacion";
import type {
  ActividadParadero,
  AlertaDiaria,
  BorradorReporte,
  Coordenada,
  Cuenta,
  DatosAlerta,
  Destino,
  Favoritos,
  Insignia,
  InterpretacionReporte,
  Linea,
  LineaSugerida,
  LugarGuardado,
  Notificacion,
  OpcionRuta,
  OpcionRutaAlerta,
  Paradero,
  ParaderoFavorito,
  ParaderoTramo,
  ProximaUnidad,
  Reporte,
  ReporteHistorial,
  ResultadoReporte,
  ResumenParadero,
  RutaGuardada,
  Sentido,
  TipoSeguridad,
  UnidadEnCamino,
  UnidadEnVivo,
  Usuario,
  Via,
  ViajeAlerta,
  ZonaSeguridad,
} from "@/types";
import { enmascararCorreo, enmascararTelefono, formatoHora } from "@/utils/formato";
import { distanciaMetros } from "@/utils/geo";

import {
  cargarCatalogo,
  destinos,
  destinosComunes,
  destinosRecientes,
  lineas,
  paraderos,
  rutasPorDestino,
  vias,
} from "./catalogo";
import { reprogramarRecordatorios } from "./notificacionesLocales";
import { getAjustes } from "./preferencias";
import { consultar, getSesionActual } from "./sesion";
import { getSimulacion, SinConexionError } from "./simulacion";
import { obtenerUbicacion } from "./ubicacion";
import { interpretarReporte as interpretarConIA, subirFotoReporte, supabase } from "./supabase";

const RADIO_CERCANO_M = 2000;
// Un lugar guardado usa las rutas del destino conocido más cercano dentro de este radio // supuesto
const RADIO_LUGAR_M = 5000;

// Asegura el catálogo de Supabase (una vez) y simula la latencia de red
// (300–600 ms) de lo que aún sale de los mocks
const esperar = async () => {
  await cargarCatalogo();
  await Promise.all([
    cargarDatosUsuario(),
    new Promise<void>((resolve) => setTimeout(resolve, 300 + Math.random() * 300)),
  ]);
};

// Datos del usuario (5.6): favoritos, lugares y alertas de sus tablas, en
// memoria por usuario. Las escrituras van primero a la base y después aquí.
const favoritas = new Set<string>();
// En el orden en que se marcaron
const paraderosMarcados = new Set<string>();
const lugaresGuardados: LugarGuardado[] = [];
const alertas: AlertaDiaria[] = [];

let datosDe: string | null = null;
let cargaDatos: Promise<void> | null = null;

type FilaAlerta = {
  id: string;
  linea_id: string;
  paradero_id: string;
  destino_id: string;
  hora: number;
  minuto: number;
  dias: number[];
  minutos_antes: AlertaDiaria["minutosAntes"];
  transito: boolean;
  seguridad: boolean;
  activa: boolean;
};

const filaAAlerta = (fila: FilaAlerta): AlertaDiaria => ({
  id: fila.id,
  lineaId: fila.linea_id,
  paraderoId: fila.paradero_id,
  destinoId: fila.destino_id,
  hora: fila.hora,
  minuto: fila.minuto,
  dias: fila.dias,
  minutosAntes: fila.minutos_antes,
  transito: fila.transito,
  seguridad: fila.seguridad,
  activa: fila.activa,
});

const alertaAFila = (alerta: DatosAlerta) => ({
  linea_id: alerta.lineaId,
  paradero_id: alerta.paraderoId,
  destino_id: alerta.destinoId,
  hora: alerta.hora,
  minuto: alerta.minuto,
  dias: alerta.dias,
  minutos_antes: alerta.minutosAntes,
  transito: alerta.transito,
  seguridad: alerta.seguridad,
  activa: alerta.activa,
});

async function leerDatosUsuario(usuarioId: string) {
  const [rLineas, rParaderos, rLugares, rAlertas] = await Promise.all([
    consultar(async () => await supabase.from("lineas_favoritas").select("linea_id").order("creado_en")),
    consultar(async () => await supabase.from("paraderos_favoritos").select("paradero_id").order("creado_en")),
    consultar(async () => await supabase.from("lugares").select("id, nombre, direccion, lat, lng")),
    consultar(async () => await supabase.from("alertas").select("*").order("creado_en")),
  ]);
  favoritas.clear();
  (rLineas.data as { linea_id: string }[]).forEach((fila) => favoritas.add(fila.linea_id));
  paraderosMarcados.clear();
  (rParaderos.data as { paradero_id: string }[]).forEach((fila) => paraderosMarcados.add(fila.paradero_id));
  // Casa, Trabajo, U (orden de F3_01)
  const orden: LugarGuardado["nombre"][] = ["Casa", "Trabajo", "U"];
  lugaresGuardados.splice(
    0,
    lugaresGuardados.length,
    ...(rLugares.data as LugarGuardado[]).sort((a, b) => orden.indexOf(a.nombre) - orden.indexOf(b.nombre)),
  );
  alertas.splice(0, alertas.length, ...(rAlertas.data as FilaAlerta[]).map(filaAAlerta));
  datosDe = usuarioId;
  // Al entrar o abrir la app también quedan programadas las alertas ya guardadas
  void sincronizarRecordatorios();
}

// Una vez por usuario. Sin red no falla: se usan los últimos datos leídos
async function cargarDatosUsuario() {
  const sesion = await getSesionActual();
  if (!sesion || sesion.usuarioId === datosDe) {
    return;
  }
  cargaDatos ??= leerDatosUsuario(sesion.usuarioId)
    .catch(() => {})
    .finally(() => {
      cargaDatos = null;
    });
  await cargaDatos;
}

// Minúsculas y sin tildes, para comparar textos de búsqueda
const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

// Minutos que tarda una unidad en recorrer la distancia, a velocidad media
const minutosEnRecorrer = (metros: number) => metros / ((VELOCIDAD_MEDIA_KMH * 1000) / 60);

const minutosDesde = (fechaISO: string) => Math.floor((Date.now() - new Date(fechaISO).getTime()) / 60_000);

// Reportes de las últimas VENTANA_REPORTES_H horas, leídos de Supabase y
// guardados en memoria (como el catálogo). Las funciones de lectura llaman a
// esperarConReportes() y después usan este arreglo.
const reportes: Reporte[] = [];
// Abarca la ventana más grande de la app (mapa de seguridad de 24 h y
// «reportes de hoy»)
const VENTANA_REPORTES_H = 24;
// Una lectura más nueva que esto se reutiliza (una pantalla llama a varias funciones)
const MEMORIA_REPORTES_MS = 15_000;
const MAX_REPORTES = 500;

let reportesLeidosEn = 0;
let lecturaReportes: Promise<void> | null = null;

async function leerReportesRecientes() {
  const desde = new Date(Date.now() - VENTANA_REPORTES_H * 3_600_000).toISOString();
  try {
    const [sesion, { data }] = await Promise.all([
      getSesionActual(),
      consultar(
        async () =>
          await supabase
            .from("reportes")
            .select("*")
            .gte("creado_en", desde)
            .order("creado_en", { ascending: false })
            .limit(MAX_REPORTES),
      ),
    ]);
    const filas = (data as FilaReporte[]).map((fila) => filaAReporte(fila, sesion?.usuarioId));
    reportes.splice(0, reportes.length, ...filas);
    reportesLeidosEn = Date.now();
  } catch {
    // Sin red se siguen usando los últimos reportes leídos (o ninguno)
  }
}

function reportesRecientes(): Promise<void> {
  if (Date.now() - reportesLeidosEn < MEMORIA_REPORTES_MS) {
    return Promise.resolve();
  }
  lecturaReportes ??= leerReportesRecientes().finally(() => {
    lecturaReportes = null;
  });
  return lecturaReportes;
}

// Fuerza a leer de nuevo (después de crear un reporte; en 5.5, al llegar uno en tiempo real)
export function invalidarReportes() {
  reportesLeidosEn = 0;
}

const esperarConReportes = async () => {
  await Promise.all([esperar(), reportesRecientes()]);
};

export async function getLineas(): Promise<Linea[]> {
  await esperar();
  return lineas;
}

export async function getLinea(id: string): Promise<Linea | null> {
  await esperar();
  return lineas.find((linea) => linea.id === id) ?? null;
}

export async function getParadero(id: string): Promise<Paradero | null> {
  await esperar();
  return paraderos.find((paradero) => paradero.id === id) ?? null;
}

// Paraderos de la línea en orden de recorrido para el sentido indicado.
export async function getRecorrido(lineaId: string, sentido: Sentido): Promise<Paradero[]> {
  await esperar();
  const linea = lineas.find((l) => l.id === lineaId);
  if (!linea) {
    return [];
  }
  const ids = sentido === "ida" ? linea.recorridoIda : linea.recorridoVuelta;
  return ids.flatMap((id) => paraderos.find((paradero) => paradero.id === id) ?? []);
}

export async function esFavorita(lineaId: string): Promise<boolean> {
  await esperar();
  return favoritas.has(lineaId);
}

// Marca o desmarca la línea y devuelve el estado nuevo (true = favorita).
export async function alternarFavorita(lineaId: string): Promise<boolean> {
  await esperar();
  if (favoritas.has(lineaId)) {
    await consultar(async () => await supabase.from("lineas_favoritas").delete().eq("linea_id", lineaId));
    favoritas.delete(lineaId);
    return false;
  }
  await consultar(async () => await supabase.from("lineas_favoritas").insert({ linea_id: lineaId }));
  favoritas.add(lineaId);
  return true;
}

function masCercano<T extends Coordenada>(lat: number, lng: number, lugares: T[]): T | null {
  let cercano: T | null = null;
  let menor = Infinity;
  for (const lugar of lugares) {
    const distancia = distanciaMetros(lat, lng, lugar.lat, lugar.lng);
    if (distancia < menor) {
      menor = distancia;
      cercano = lugar;
    }
  }
  return cercano;
}

const paraderoMasCercano = (lat: number, lng: number) => masCercano(lat, lng, paraderos);

export async function getParaderoCercano(lat: number, lng: number): Promise<Paradero | null> {
  await esperar();
  return paraderoMasCercano(lat, lng);
}

const lineasDelParadero = (paraderoId: string) =>
  lineas.filter((linea) => linea.recorridoIda.includes(paraderoId) || linea.recorridoVuelta.includes(paraderoId));

// Líneas que pasan por el paradero en cualquiera de los dos sentidos
export async function getLineasPorParadero(paraderoId: string): Promise<Linea[]> {
  await esperar();
  return lineasDelParadero(paraderoId);
}

// En el orden en que se marcaron
export async function getParaderosFavoritos(): Promise<Paradero[]> {
  await esperar();
  return [...paraderosMarcados].flatMap((id) => paraderos.find((paradero) => paradero.id === id) ?? []);
}

export async function esParaderoFavorito(paraderoId: string): Promise<boolean> {
  await esperar();
  return paraderosMarcados.has(paraderoId);
}

// Marca o desmarca el paradero y devuelve el estado nuevo (true = favorito).
export async function alternarParaderoFavorito(paraderoId: string): Promise<boolean> {
  await esperar();
  if (paraderosMarcados.has(paraderoId)) {
    await consultar(async () => await supabase.from("paraderos_favoritos").delete().eq("paradero_id", paraderoId));
    paraderosMarcados.delete(paraderoId);
    return false;
  }
  await consultar(async () => await supabase.from("paraderos_favoritos").insert({ paradero_id: paraderoId }));
  paraderosMarcados.add(paraderoId);
  return true;
}

// Fase 6: geocodificación inversa de la ubicación real.
export async function getViaCercana(lat: number, lng: number): Promise<Via | null> {
  await esperar();
  return masCercano(lat, lng, vias);
}

export async function buscarDestinos(texto: string): Promise<Destino[]> {
  await esperar();
  const consulta = normalizar(texto);
  return destinos.filter((destino) => normalizar(destino.nombre).includes(consulta));
}

// Distancia de edición (Levenshtein): cuántas letras hay que cambiar,
// agregar o quitar para pasar de `a` a `b`
function distanciaEdicion(a: string, b: string): number {
  let anterior = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const actual = [i];
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      actual[j] = Math.min(anterior[j] + 1, actual[j - 1] + 1, anterior[j - 1] + costo);
    }
    anterior = actual;
  }
  return anterior[b.length];
}

// Letras de diferencia que se toleran para sugerir un destino (E1)
const MAX_DIFERENCIA_SUGERENCIA = 3;

// Destino con el nombre más parecido a lo escrito («Jokey Plasa» → Jockey
// Plaza), para cuando la búsqueda no encuentra nada (E1). null si ninguno se
// parece lo suficiente.
export async function sugerirDestino(texto: string): Promise<Destino | null> {
  await esperar();
  const consulta = normalizar(texto);
  let mejor: Destino | null = null;
  let menor = MAX_DIFERENCIA_SUGERENCIA + 1;
  for (const destino of destinos) {
    const distancia = distanciaEdicion(consulta, normalizar(destino.nombre));
    if (distancia < menor) {
      menor = distancia;
      mejor = destino;
    }
  }
  return mejor;
}

const porIds = (ids: string[]) => ids.flatMap((id) => destinos.find((destino) => destino.id === id) ?? []);

export async function getDestinosRecientes(): Promise<Destino[]> {
  await esperar();
  return porIds(destinosRecientes);
}

export async function getDestinosComunes(): Promise<Destino[]> {
  await esperar();
  return porIds(destinosComunes);
}

// Nombre de destino o de lugar guardado (Casa, Trabajo, U) → destino conocido.
// Un lugar guardado se resuelve por sus coordenadas al destino más cercano.
function resolverDestino(nombre: string): Destino | null {
  const consulta = normalizar(nombre);
  const destino = destinos.find((d) => normalizar(d.nombre) === consulta);
  if (destino) {
    return destino;
  }

  const lugar = lugaresGuardados.find((l) => normalizar(l.nombre) === consulta);
  if (!lugar) {
    return null;
  }
  let cercano: Destino | null = null;
  let menor = RADIO_LUGAR_M;
  for (const d of destinos) {
    const distancia = distanciaMetros(lugar.lat, lugar.lng, d.lat, d.lng);
    if (distancia <= menor) {
      menor = distancia;
      cercano = d;
    }
  }
  return cercano;
}

// `origen` todavía no se usa: por ahora siempre es "Mi ubicación".
// Destino buscado (nombre o lugar guardado) con sus coordenadas, para el mapa de F1_06
export async function getDestino(nombre: string): Promise<Destino | null> {
  await esperar();
  return resolverDestino(nombre);
}

export async function buscarRutas(origen: string, destino: string): Promise<OpcionRuta[]> {
  await esperarConReportes();
  if (getSimulacion().forzarError) {
    throw new Error("El servicio de rutas no responde");
  }
  const encontrado = resolverDestino(destino);
  if (!encontrado) {
    return [];
  }

  const opciones: OpcionRuta[] = [];
  for (const ruta of rutasPorDestino[encontrado.id] ?? []) {
    const linea = lineas.find((l) => l.id === ruta.lineaId);
    if (!linea) {
      continue;
    }
    const edades = reportes
      .filter((reporte) => reporte.lineaId === linea.id)
      .map((reporte) => minutosDesde(reporte.creadoEn))
      .filter((min) => min <= VIGENCIA_REPORTE_MIN);
    const estimado = ruta.reportesActivos === 0;

    opciones.push({
      linea,
      etaMin: ruta.etaMin,
      trafico: ruta.trafico,
      ocupacion: estimado ? undefined : ruta.ocupacion,
      reportesActivos: ruta.reportesActivos,
      ultimoReporteMin: estimado || edades.length === 0 ? null : Math.min(...edades),
      estimado,
    });
  }
  return opciones.sort((a, b) => a.etaMin - b.etaMin);
}

export async function getReportesCercanos(lat: number, lng: number): Promise<Reporte[]> {
  await esperarConReportes();
  return reportes
    .filter((reporte) => distanciaMetros(lat, lng, reporte.lat, reporte.lng) <= RADIO_CERCANO_M)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

export async function getLugaresGuardados(): Promise<LugarGuardado[]> {
  await esperar();
  return [...lugaresGuardados];
}

// Reporte con tus palabras (7.1): la IA propone un borrador; el usuario lo
// confirma en los pasos de siempre. Errores: SinConexionError o ErrorIA.
export async function interpretarReporte(texto: string): Promise<InterpretacionReporte> {
  await esperar();
  if (getSimulacion().forzarSinRed) {
    throw new SinConexionError();
  }
  return interpretarConIA(texto);
}

export { ErrorIA, type MotivoErrorIA } from "./supabase";

// Notificaciones locales (6.3)
export { cancelarTodosLosAvisos, pedirPermisoNotificaciones } from "./notificacionesLocales";

// Interruptor «Usar ubicación de prueba» (/dev/datos)
export { getUsarUbicacionPrueba, setUsarUbicacionPrueba } from "./ubicacion";

// GPS del celular o la ubicación de prueba (src/data/ubicacion.ts, 6.1)
export async function getUbicacionUsuario(): Promise<Coordenada> {
  const [, ubicacion] = await Promise.all([esperar(), obtenerUbicacion()]);
  return ubicacion;
}

// Del más cercano al más lejano
export async function getParaderosCercanos(lat: number, lng: number): Promise<Paradero[]> {
  await esperar();
  const distancia = (paradero: Paradero) => distanciaMetros(lat, lng, paradero.lat, paradero.lng);
  return paraderos
    .filter((paradero) => distancia(paradero) <= RADIO_CERCANO_M)
    .sort((a, b) => distancia(a) - distancia(b));
}

// Última ubicación reportada de cada línea cerca del punto.
export async function getUnidadesEnVivo(lat: number, lng: number): Promise<UnidadEnVivo[]> {
  await esperarConReportes();
  const unidades: UnidadEnVivo[] = [];
  const vigentes = reportes
    .filter((reporte) => reporte.tipo === "ubicacion" && minutosDesde(reporte.creadoEn) <= VIGENCIA_REPORTE_MIN)
    .filter((reporte) => distanciaMetros(lat, lng, reporte.lat, reporte.lng) <= RADIO_CERCANO_M)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
  for (const reporte of vigentes) {
    const linea = lineas.find((l) => l.id === reporte.lineaId);
    if (linea && !unidades.some((u) => u.linea.id === linea.id)) {
      unidades.push({ linea, lat: reporte.lat, lng: reporte.lng });
    }
  }
  return unidades;
}

// Cada confirmación cuenta como un reporte más del mismo hecho.
export async function getActividadParadero(paraderoId: string): Promise<ActividadParadero> {
  await esperarConReportes();
  const vigentes = reportes
    .filter((reporte) => reporte.paraderoId === paraderoId && minutosDesde(reporte.creadoEn) <= VIGENCIA_REPORTE_MIN)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
  return {
    reportesActivos: vigentes.reduce((total, reporte) => total + reporte.confirmaciones, 0),
    ultimoReporte: vigentes[0]?.creadoEn ?? null,
    ocupacion: vigentes.find((reporte) => reporte.ocupacion)?.ocupacion,
  };
}

// Último reporte de ubicación vigente de la línea
const ultimaUbicacion = (lineaId: string): Reporte | undefined =>
  reportes
    .filter((r) => r.tipo === "ubicacion" && r.lineaId === lineaId && minutosDesde(r.creadoEn) <= VIGENCIA_REPORTE_MIN)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))[0];

// Minutos en llegar al paradero en línea recta a velocidad media; al menos 1
const etaHasta = (metros: number) => Math.max(Math.round(minutosEnRecorrer(metros)), 1);

// Unidad de la línea más próxima al paradero, según su último reporte de
// ubicación vigente; null si no hay. La ETA sale de la distancia en línea
// recta a velocidad media.
export async function getUnidadEnCamino(lineaId: string, paraderoId: string): Promise<UnidadEnCamino | null> {
  await esperarConReportes();
  const linea = lineas.find((l) => l.id === lineaId);
  const paradero = paraderos.find((p) => p.id === paraderoId);
  const reporte = ultimaUbicacion(lineaId);
  if (!linea || !paradero || !reporte) {
    return null;
  }
  const distanciaM = distanciaMetros(reporte.lat, reporte.lng, paradero.lat, paradero.lng);
  return {
    linea,
    lat: reporte.lat,
    lng: reporte.lng,
    distanciaM,
    etaMin: etaHasta(distanciaM),
    ocupacion: reporte.ocupacion,
    velocidad: reporte.velocidad,
    pasajeros: reporte.confirmaciones,
    actualizadoEn: reporte.creadoEn,
  };
}

// Unidad de la línea que llega al paradero. Sin reporte de ubicación vigente,
// la espera estimada es la frecuencia de la línea (peor caso).
function proximaUnidad(linea: Linea, paradero: Paradero): ProximaUnidad {
  const reporte = ultimaUbicacion(linea.id);
  if (!reporte) {
    return { linea, minutos: linea.frecuenciaMin, fuente: "sin_datos" };
  }
  return {
    linea,
    minutos: etaHasta(distanciaMetros(reporte.lat, reporte.lng, paradero.lat, paradero.lng)),
    fuente: minutosDesde(reporte.creadoEn) < UMBRAL_EN_VIVO_MIN ? "en_vivo" : "reporte",
    ocupacion: reporte.ocupacion,
    reportadoEn: reporte.creadoEn,
  };
}

// Unidades de cada línea del paradero, de la que llega primero a la última
const proximasDelParadero = (paradero: Paradero) =>
  lineasDelParadero(paradero.id)
    // Una línea suspendida (E9) no tiene unidades que lleguen
    .filter((linea) => !linea.suspendida)
    .map((linea) => proximaUnidad(linea, paradero))
    .sort((a, b) => a.minutos - b.minutos);

// Detalle de paradero (F3_02): último reporte de paradero, reportes de
// seguridad y unidades que llegan, de las últimas VENTANA_PARADERO_H horas.
// null si el paradero no existe.
export async function getResumenParadero(paraderoId: string): Promise<ResumenParadero | null> {
  const [, recientes] = await Promise.all([esperar(), getReportesSeguridad(VENTANA_PARADERO_H)]);
  const paradero = paraderos.find((p) => p.id === paraderoId);
  if (!paradero) {
    return null;
  }

  const ultimo = reportes
    .filter(
      (r) =>
        r.tipo === "paradero" && r.paraderoId === paraderoId && minutosDesde(r.creadoEn) <= VENTANA_PARADERO_H * 60,
    )
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))[0];

  return {
    paradero,
    estado: ultimo ? { ocupacion: ultimo.ocupacion, espera: ultimo.espera, creadoEn: ultimo.creadoEn } : null,
    seguridad: recientes.filter((r) => r.paraderoId === paraderoId),
    proximas: proximasDelParadero(paradero),
  };
}

// Paraderos desde el de espera hasta el de bajada (ambos incluidos), con los
// minutos acumulados a velocidad media. Se baja en el paradero del recorrido
// más cercano al destino; si el destino no se conoce, en el último.
export async function getTramoViaje(
  lineaId: string,
  sentido: Sentido,
  paraderoEsperaId: string,
  destino: string,
): Promise<ParaderoTramo[]> {
  await esperar();
  const linea = lineas.find((l) => l.id === lineaId);
  if (!linea) {
    return [];
  }
  const ids = sentido === "ida" ? linea.recorridoIda : linea.recorridoVuelta;
  const restantes = ids
    .slice(Math.max(ids.indexOf(paraderoEsperaId), 0))
    .flatMap((id) => paraderos.find((paradero) => paradero.id === id) ?? []);

  let fin = restantes.length - 1;
  const lugar = resolverDestino(destino);
  if (lugar) {
    let menor = Infinity;
    restantes.forEach((paradero, i) => {
      const distancia = distanciaMetros(lugar.lat, lugar.lng, paradero.lat, paradero.lng);
      // Desde 1: no se baja en el mismo paradero donde sube
      if (i > 0 && distancia < menor) {
        menor = distancia;
        fin = i;
      }
    });
  }

  let metros = 0;
  return restantes.slice(0, fin + 1).map((paradero, i, tramo) => {
    if (i > 0) {
      metros += distanciaMetros(tramo[i - 1].lat, tramo[i - 1].lng, paradero.lat, paradero.lng);
    }
    return { paradero, minutos: Math.round(minutosEnRecorrer(metros)) };
  });
}

// Fila de la tabla reportes (snake_case) → Reporte. Los anónimos de otros
// no dicen quién los envió (decisión 55)
type FilaReporte = {
  id: string;
  tipo: Reporte["tipo"];
  usuario_id: string | null;
  linea_id: string | null;
  paradero_id: string | null;
  lat: number;
  lng: number;
  ocupacion: Reporte["ocupacion"] | null;
  velocidad: Reporte["velocidad"] | null;
  nota: string | null;
  valoracion: number | null;
  etiquetas: string[] | null;
  espera: Reporte["espera"] | null;
  congestion: Reporte["congestion"] | null;
  causas: Reporte["causas"] | null;
  via: string | null;
  seguridad: Reporte["seguridad"] | null;
  urgente: boolean;
  anonimo: boolean;
  foto_url: string | null;
  creado_en: string;
  confirmaciones: number;
};

function filaAReporte(fila: FilaReporte, usuarioId?: string): Reporte {
  const propio = fila.usuario_id != null && fila.usuario_id === usuarioId;
  return {
    id: fila.id,
    tipo: fila.tipo,
    usuarioId: fila.usuario_id && (propio || !fila.anonimo) ? fila.usuario_id : undefined,
    lineaId: fila.linea_id ?? undefined,
    paraderoId: fila.paradero_id ?? undefined,
    lat: fila.lat,
    lng: fila.lng,
    ocupacion: fila.ocupacion ?? undefined,
    velocidad: fila.velocidad ?? undefined,
    nota: fila.nota ?? undefined,
    valoracion: fila.valoracion ?? undefined,
    etiquetas: fila.etiquetas ?? undefined,
    espera: fila.espera ?? undefined,
    congestion: fila.congestion ?? undefined,
    causas: fila.causas ?? undefined,
    via: fila.via ?? undefined,
    seguridad: fila.seguridad ?? undefined,
    urgente: fila.urgente || undefined,
    anonimo: fila.anonimo || undefined,
    fotoUri: fila.foto_url ?? undefined,
    creadoEn: fila.creado_en,
    confirmaciones: fila.confirmaciones,
  };
}

// Usuario de la sesión; sin sesión las pantallas de la app no se muestran
async function sesionActual() {
  const sesion = await getSesionActual();
  if (!sesion) {
    throw new Error("No hay sesión");
  }
  return sesion;
}

type FilaPerfil = { nombre: string; puntos: number; telefono: string | null; eliminacion_el: string | null };

async function leerPerfil(usuarioId: string): Promise<FilaPerfil> {
  const { data } = await consultar(
    async () =>
      await supabase.from("perfiles").select("nombre, puntos, telefono, eliminacion_el").eq("id", usuarioId).single(),
  );
  return data as FilaPerfil;
}

// Reportes propios, del más reciente al más antiguo (historial, insignias, estadísticas)
async function leerReportesPropios(usuarioId: string): Promise<Reporte[]> {
  const { data } = await consultar(
    async () =>
      await supabase.from("reportes").select("*").eq("usuario_id", usuarioId).order("creado_en", { ascending: false }),
  );
  return (data as FilaReporte[]).map((fila) => filaAReporte(fila, usuarioId));
}

const esDelMes = (fechaISO: string) => {
  const fecha = new Date(fechaISO);
  const hoy = new Date();
  return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
};

// Perfil de Supabase + estadísticas del mes con los reportes propios (F2_09)
export async function getUsuario(): Promise<Usuario> {
  await esperar();
  const { usuarioId } = await sesionActual();
  const [perfil, propios] = await Promise.all([leerPerfil(usuarioId), leerReportesPropios(usuarioId)]);
  const delMes = propios.filter((reporte) => esDelMes(reporte.creadoEn));
  const confirmados = delMes.filter((reporte) => reporte.confirmaciones > 1).length;
  return {
    id: usuarioId,
    nombre: perfil.nombre,
    puntos: perfil.puntos,
    reportesMes: delMes.length,
    porcentajeConfirmados: delMes.length ? Math.round((confirmados / delMes.length) * 100) : 0,
    telefono: enmascararTelefono(perfil.telefono),
  };
}

// Cuenta (D1–D5): perfil de Supabase y correo de la sesión, enmascarados.
// Pendiente (5.7): un proceso programado borra la cuenta al vencer el
// periodo de gracia y envía el comprobante por correo.
export async function getCuenta(): Promise<Cuenta> {
  await esperar();
  if (getSimulacion().forzarError) {
    throw new Error("No se pudo cargar la cuenta");
  }
  const { usuarioId, correo } = await sesionActual();
  const perfil = await leerPerfil(usuarioId);
  return {
    nombre: perfil.nombre,
    puntos: perfil.puntos,
    telefono: enmascararTelefono(perfil.telefono),
    correo: enmascararCorreo(correo),
    eliminacionEl: perfil.eliminacion_el,
  };
}

// Llama a una función de cuenta de 004_cuenta.sql
async function rpcCuenta<T = null>(funcion: string): Promise<T> {
  if (getSimulacion().forzarSinRed) {
    throw new SinConexionError();
  }
  const { data } = await consultar(async () => await supabase.rpc(funcion));
  return data as T;
}

// Oculta el perfil y pausa las alertas hasta que el usuario vuelva a iniciar
// sesión (la app cierra la sesión; al entrar se reactiva)
export async function desactivarCuenta(): Promise<void> {
  await esperar();
  await rpcCuenta("desactivar_cuenta");
}

// Programa la eliminación (30 días) y devuelve la fecha efectiva (ISO)
export async function solicitarEliminacion(): Promise<string> {
  await esperar();
  return rpcCuenta<string>("solicitar_eliminacion");
}

export async function cancelarEliminacion(): Promise<void> {
  await esperar();
  await rpcCuenta("cancelar_eliminacion");
}

const esDeHoy = (fechaISO: string) => new Date(fechaISO).toDateString() === new Date().toDateString();

// Distancia al paradero más cercano del recorrido y reportes de hoy de la línea
function sugerir(linea: Linea, lat: number, lng: number): LineaSugerida {
  const distancias = linea.recorridoIda.flatMap((id) => {
    const paradero = paraderos.find((p) => p.id === id);
    return paradero ? [distanciaMetros(lat, lng, paradero.lat, paradero.lng)] : [];
  });
  const reportesHoy = reportes
    .filter((reporte) => reporte.lineaId === linea.id && esDeHoy(reporte.creadoEn))
    .reduce((total, reporte) => total + reporte.confirmaciones, 0);
  return { linea, distanciaM: Math.min(...distancias), reportesHoy };
}

// Primero las líneas que pasan cerca, de la más activa hoy a la menos; luego
// el resto, de la más cercana a la más lejana.
export async function getLineasSugeridas(lat: number, lng: number): Promise<LineaSugerida[]> {
  await esperarConReportes();
  const cerca = (s: LineaSugerida) => s.distanciaM <= RADIO_CERCANO_M;
  return lineas
    .map((linea) => sugerir(linea, lat, lng))
    .sort((a, b) => {
      if (cerca(a) !== cerca(b)) {
        return cerca(a) ? -1 : 1;
      }
      if (cerca(a) && a.reportesHoy !== b.reportesHoy) {
        return b.reportesHoy - a.reportesHoy;
      }
      return a.distanciaM - b.distanciaM;
    });
}

// Por código, nombre o empresa, sin importar tildes ni mayúsculas.
export async function buscarLineas(texto: string): Promise<LineaSugerida[]> {
  const [, ubicacion] = await Promise.all([esperarConReportes(), obtenerUbicacion()]);
  const consulta = normalizar(texto);
  return lineas
    .filter((linea) => [linea.codigo, linea.nombre, linea.empresa].some((campo) => normalizar(campo).includes(consulta)))
    .map((linea) => sugerir(linea, ubicacion.lat, ubicacion.lng));
}

// Tipos de reporte que se asocian al paradero más cercano
const TIPOS_EN_PARADERO: Reporte["tipo"][] = ["paradero", "seguridad"];

// Guarda el reporte en Supabase con la RPC crear_reporte, que también suma
// los puntos al perfil. Sin red lanza SinConexionError (va a la cola E3).
export async function crearReporte(borrador: BorradorReporte): Promise<ResultadoReporte> {
  await esperar();
  if (getSimulacion().forzarSinRed) {
    throw new SinConexionError();
  }
  const { tipo } = borrador;
  if (!tipo) {
    throw new Error("El reporte no tiene tipo");
  }
  const { lat, lng } = borrador.posicion ?? (await obtenerUbicacion());
  // Antes de insertar: si falla aquí (sin red) el reporte va a la cola sin
  // haberse guardado, así no se duplica al reenviarlo
  const usuario = await getUsuario();

  // Foto opcional (F2_06): sin red el reporte va a la cola con la foto; si
  // falla por otra causa (p. ej. el archivo temporal ya no existe), sale sin ella
  let fotoUrl: string | undefined;
  if (borrador.fotoUri) {
    try {
      fotoUrl = await subirFotoReporte(usuario.id, borrador.fotoUri);
    } catch (error) {
      if (error instanceof SinConexionError) {
        throw error;
      }
    }
  }

  const datos = {
    tipo,
    linea_id: borrador.lineaId,
    paradero_id: TIPOS_EN_PARADERO.includes(tipo)
      ? (borrador.paraderoId ?? paraderoMasCercano(lat, lng)?.id)
      : undefined,
    lat,
    lng,
    ocupacion: borrador.ocupacion,
    velocidad: borrador.velocidad,
    valoracion: borrador.valoracion,
    etiquetas: borrador.etiquetas,
    espera: borrador.espera,
    congestion: borrador.congestion,
    causas: borrador.causas,
    via: borrador.via,
    seguridad: borrador.seguridad,
    urgente: borrador.urgente,
    anonimo: borrador.anonimo,
    nota: borrador.nota,
    foto_url: fotoUrl,
  };
  const { data } = await consultar(async () => await supabase.rpc("crear_reporte", { datos }));
  const { reporte: fila, puntos } = data as { reporte: FilaReporte; puntos: number };
  invalidarReportes();

  return {
    reporte: filaAReporte(fila, usuario.id),
    puntosGanados: puntos,
    // La RPC ya sumó los puntos en perfiles
    usuario: { ...usuario, puntos: usuario.puntos + puntos, reportesMes: usuario.reportesMes + 1 },
    // supuesto: hasta tener Realtime, un número creíble de pasajeros cerca
    personasQueLoVen: 20 + Math.floor(Math.random() * 41),
  };
}

// Reportes de seguridad de las últimas `horas`, del más reciente al más
// antiguo (mapa de seguridad, F3_06). Los anónimos no dicen quién los envió.
export async function getReportesSeguridad(horas: number): Promise<Reporte[]> {
  await esperarConReportes();
  return reportes
    .filter((reporte) => reporte.tipo === "seguridad" && minutosDesde(reporte.creadoEn) <= horas * 60)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
    .map((reporte) => (reporte.anonimo ? { ...reporte, usuarioId: undefined } : reporte));
}

// Reportes de seguridad de las últimas `horas` agrupados por paradero, de la
// zona con más reportes a la de menos (F3_06). `tipo` filtra por lo que pasó.
export async function getZonasSeguridad(horas: number, tipo?: TipoSeguridad): Promise<ZonaSeguridad[]> {
  const recientes = (await getReportesSeguridad(horas)).filter((r) => !tipo || r.seguridad === tipo);

  const porParadero = new Map<string, Reporte[]>();
  for (const reporte of recientes) {
    if (reporte.paraderoId) {
      porParadero.set(reporte.paraderoId, [...(porParadero.get(reporte.paraderoId) ?? []), reporte]);
    }
  }

  const zonas: ZonaSeguridad[] = [];
  for (const [paraderoId, delParadero] of porParadero) {
    const paradero = paraderos.find((p) => p.id === paraderoId);
    if (!paradero) continue;

    const conteo = new Map<TipoSeguridad, number>();
    for (const r of delParadero) {
      if (r.seguridad) conteo.set(r.seguridad, (conteo.get(r.seguridad) ?? 0) + 1);
    }
    const tipoFrecuente = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "paradero_peligroso";

    zonas.push({
      paradero,
      nivel: delParadero.length >= UMBRAL_ZONA_ALTA ? "alto" : "medio",
      cantidad: delParadero.length,
      tipoFrecuente,
      // getReportesSeguridad ya los ordena del más reciente al más antiguo
      ultimo: delParadero[0].creadoEn,
    });
  }

  return zonas.sort((a, b) => b.cantidad - a.cantidad);
}

// Reportes del usuario, del más reciente al más antiguo (F2_09).
export async function getHistorialReportes(): Promise<ReporteHistorial[]> {
  await esperar();
  if (getSimulacion().forzarVacio) {
    return [];
  }
  const { usuarioId } = await sesionActual();
  const propios = await leerReportesPropios(usuarioId);
  return propios.map((reporte) => ({
    reporte,
    linea: lineas.find((l) => l.id === reporte.lineaId),
    puntos: PUNTOS_POR_TIPO[reporte.tipo],
    vencido: minutosDesde(reporte.creadoEn) > VIGENCIA_REPORTE_MIN,
  }));
}

// Insignias de F2_09 según los reportes propios (reglas en config/insignias)
export async function getInsignias(): Promise<Insignia[]> {
  await esperar();
  const { usuarioId } = await sesionActual();
  const propios = await leerReportesPropios(usuarioId);
  return INSIGNIAS.map(({ cumple, ...insignia }) => ({ ...insignia, obtenida: cumple(propios) }));
}

// Alertas diarias (tabla alertas). Pendiente: las dispara el servidor.
export async function getAlertas(): Promise<AlertaDiaria[]> {
  await esperar();
  return [...alertas];
}

export async function getAlerta(id: string): Promise<AlertaDiaria | null> {
  await esperar();
  return alertas.find((alerta) => alerta.id === id) ?? null;
}

// Alerta que sube en el paradero; null si no hay
export async function getAlertaDeParadero(paraderoId: string): Promise<AlertaDiaria | null> {
  await esperar();
  return alertas.find((alerta) => alerta.paraderoId === paraderoId) ?? null;
}

// Crea la alerta si no trae id; si no, la reemplaza.
export async function guardarAlerta(datos: DatosAlerta): Promise<AlertaDiaria> {
  await esperar();
  const { data } = datos.id
    ? await consultar(
        async () => await supabase.from("alertas").update(alertaAFila(datos)).eq("id", datos.id!).select().single(),
      )
    : await consultar(async () => await supabase.from("alertas").insert(alertaAFila(datos)).select().single());
  const alerta = filaAAlerta(data as FilaAlerta);
  const i = alertas.findIndex((a) => a.id === alerta.id);
  if (i === -1) {
    alertas.push(alerta);
  } else {
    alertas[i] = alerta;
  }
  void sincronizarRecordatorios();
  return alerta;
}

export async function eliminarAlerta(id: string): Promise<void> {
  await esperar();
  await consultar(async () => await supabase.from("alertas").delete().eq("id", id));
  const i = alertas.findIndex((alerta) => alerta.id === id);
  if (i !== -1) {
    alertas.splice(i, 1);
  }
  void sincronizarRecordatorios();
}

// Recordatorios locales de las alertas activas (6.3). Con «Alertas de rutas»
// apagado (F3_05) no se programa ninguno. `encendidas` evita leer el ajuste
// mientras se está guardando.
export async function sincronizarRecordatorios(encendidas?: boolean): Promise<void> {
  const activas = encendidas ?? (await getAjustes()).alertasRutas;
  const lista = activas
    ? alertas.flatMap((alerta) => {
        const linea = lineas.find((l) => l.id === alerta.lineaId);
        const paradero = paraderos.find((p) => p.id === alerta.paraderoId);
        if (!alerta.activa || !linea || !paradero || alerta.dias.length === 0) {
          return [];
        }
        return [
          {
            alertaId: alerta.id,
            hora: alerta.hora,
            minuto: alerta.minuto,
            dias: alerta.dias,
            minutosAntes: alerta.minutosAntes,
            titulo: `Alerta · ${linea.nombre}`,
            cuerpo: `Sales a las ${formatoHora(alerta.hora, alerta.minuto)} de ${paradero.nombre}: mira dónde viene tu carro`,
          },
        ];
      })
    : [];
  await reprogramarRecordatorios(lista);
}

// Sentido de la línea en que el paradero del recorrido más cercano al destino
// viene después del de subida (la misma bajada que elige getTramoViaje); null
// si en ninguno llega
function sentidoHacia(linea: Linea, subidaId: string, destino: Destino): Sentido | null {
  const sentidos: [Sentido, string[]][] = [
    ["ida", linea.recorridoIda],
    ["vuelta", linea.recorridoVuelta],
  ];
  for (const [sentido, ids] of sentidos) {
    const recorrido = ids.flatMap((id) => paraderos.find((paradero) => paradero.id === id) ?? []);
    const bajada = masCercano(destino.lat, destino.lng, recorrido);
    const subida = ids.indexOf(subidaId);
    if (bajada !== null && subida !== -1 && ids.indexOf(bajada.id) > subida) {
      return sentido;
    }
  }
  return null;
}

const llegaAlDestino = (linea: Linea, subidaId: string, destino: Destino) =>
  sentidoHacia(linea, subidaId, destino) !== null;

// Rutas para una alerta diaria (F3_03). Cada línea + paradero de subida se
// combina con los destinos que la línea sirve en la búsqueda (rutasPorDestino)
// y a los que llega desde ese paradero. Paraderos de subida: con paraderoId,
// solo ese; si no, los favoritos (con todas sus líneas) y, para las líneas
// favoritas, el paradero de su recorrido más cercano al usuario.
export async function getOpcionesRutaAlerta(paraderoId?: string): Promise<OpcionRutaAlerta[]> {
  const [, ubicacion] = await Promise.all([esperar(), obtenerUbicacion()]);
  const subidas: { linea: Linea; paradero: Paradero }[] = [];

  const idsSubida = paraderoId ? [paraderoId] : [...paraderosMarcados];
  for (const id of idsSubida) {
    const paradero = paraderos.find((p) => p.id === id);
    if (paradero) {
      subidas.push(...lineasDelParadero(id).map((linea) => ({ linea, paradero })));
    }
  }

  if (!paraderoId) {
    for (const linea of lineas.filter((l) => favoritas.has(l.id))) {
      const recorrido = linea.recorridoIda.flatMap((id) => paraderos.find((p) => p.id === id) ?? []);
      const paradero = masCercano(ubicacion.lat, ubicacion.lng, recorrido);
      if (paradero) {
        subidas.push({ linea, paradero });
      }
    }
  }

  const opciones: OpcionRutaAlerta[] = [];
  for (const { linea, paradero } of subidas) {
    const servidos = destinos.filter((destino) =>
      rutasPorDestino[destino.id]?.some((ruta) => ruta.lineaId === linea.id),
    );
    for (const destino of servidos) {
      const repetida = opciones.some(
        (o) => o.linea.id === linea.id && o.paradero.id === paradero.id && o.destino.id === destino.id,
      );
      if (!repetida && llegaAlDestino(linea, paradero.id, destino)) {
        opciones.push({ linea, paradero, destino });
      }
    }
  }
  return opciones;
}

// Favoritos (F3_01) en una sola llamada. Paraderos en el orden en que se
// marcaron; rutas: primero las alertas y luego las líneas favoritas sin alerta.
export async function getFavoritos(): Promise<Favoritos> {
  await esperarConReportes();
  if (getSimulacion().forzarVacio) {
    return { lugares: [], paraderos: [], rutas: [] };
  }

  const favoritos: ParaderoFavorito[] = [...paraderosMarcados].flatMap((id) => {
    const paradero = paraderos.find((p) => p.id === id);
    if (!paradero) {
      return [];
    }
    return {
      paradero,
      proxima: proximasDelParadero(paradero).find((unidad) => unidad.fuente !== "sin_datos") ?? null,
      lineas: lineasDelParadero(id).length,
      alerta: alertas.find((alerta) => alerta.paraderoId === id) ?? null,
    };
  });

  const rutas: RutaGuardada[] = alertas.flatMap((alerta) => {
    const linea = lineas.find((l) => l.id === alerta.lineaId);
    const paradero = paraderos.find((p) => p.id === alerta.paraderoId);
    const destino = destinos.find((d) => d.id === alerta.destinoId);
    return linea && paradero && destino ? { tipo: "alerta" as const, alerta, linea, paradero, destino } : [];
  });
  for (const linea of lineas) {
    if (favoritas.has(linea.id) && !alertas.some((alerta) => alerta.lineaId === linea.id)) {
      rutas.push({ tipo: "linea", linea });
    }
  }

  return { lugares: [...lugaresGuardados], paraderos: favoritos, rutas };
}

// Línea, paradero, destino y sentido de la alerta, para iniciar la espera
// desde un aviso de llegada (F3_04); null si la alerta ya no existe.
export async function getViajeDeAlerta(alertaId: string): Promise<ViajeAlerta | null> {
  await esperar();
  const alerta = alertas.find((a) => a.id === alertaId);
  const linea = lineas.find((l) => l.id === alerta?.lineaId);
  const paradero = paraderos.find((p) => p.id === alerta?.paraderoId);
  const destino = destinos.find((d) => d.id === alerta?.destinoId);
  if (!linea || !paradero || !destino) {
    return null;
  }
  return { linea, paradero, destino, sentido: sentidoHacia(linea, paradero.id, destino) ?? "ida" };
}

// Avisos (tabla notificaciones). Se leen siempre de la base: más adelante
// los creará el servidor. Pendiente: Realtime / push.
type FilaNotificacion = {
  id: string;
  tipo: Notificacion["tipo"];
  titulo: string;
  detalle: string;
  fecha: string;
  leida: boolean;
  linea_id: string | null;
  paradero_id: string | null;
  alerta_id: string | null;
};

const filaANotificacion = (fila: FilaNotificacion): Notificacion => ({
  id: fila.id,
  tipo: fila.tipo,
  titulo: fila.titulo,
  detalle: fila.detalle,
  fecha: fila.fecha,
  leida: fila.leida,
  lineaId: fila.linea_id ?? undefined,
  paraderoId: fila.paradero_id ?? undefined,
  alertaId: fila.alerta_id ?? undefined,
});

// De la más reciente a la más antigua
export async function getNotificaciones(): Promise<Notificacion[]> {
  await esperar();
  if (getSimulacion().forzarVacio) {
    return [];
  }
  const { data } = await consultar(
    async () => await supabase.from("notificaciones").select("*").order("fecha", { ascending: false }),
  );
  return (data as FilaNotificacion[]).map(filaANotificacion);
}

export async function marcarNotificacionLeida(id: string): Promise<void> {
  await esperar();
  await consultar(async () => await supabase.from("notificaciones").update({ leida: true }).eq("id", id));
}

export async function contarNoLeidas(): Promise<number> {
  await esperar();
  const { count } = await consultar(
    async () =>
      await supabase.from("notificaciones").select("id", { count: "exact", head: true }).eq("leida", false),
  );
  return count ?? 0;
}

// Desarrollo: simula el aviso que dispara la primera alerta activa cuando su
// unidad está a `minutosAntes` del paradero. Falla si no hay alertas activas.
export async function simularAvisoAlerta(): Promise<Notificacion> {
  await esperar();
  const alerta = alertas.find((a) => a.activa);
  const linea = lineas.find((l) => l.id === alerta?.lineaId);
  const paradero = paraderos.find((p) => p.id === alerta?.paraderoId);
  if (!alerta || !linea || !paradero) {
    throw new Error("No hay alertas activas");
  }
  const { data } = await consultar(
    async () =>
      await supabase
        .from("notificaciones")
        .insert({
          tipo: "llegada",
          titulo: `¡Tu combi habitual está a ${alerta.minutosAntes} min del paradero!`,
          detalle: `${linea.nombre} · ${paradero.nombre}`,
          linea_id: linea.id,
          paradero_id: paradero.id,
          alerta_id: alerta.id,
        })
        .select()
        .single(),
  );
  return filaANotificacion(data as FilaNotificacion);
}
