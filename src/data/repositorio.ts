// Capa de acceso a datos. Las pantallas solo leen datos desde aquí.
// Fase 5: se reemplaza por consultas a Supabase sin cambiar las firmas.
import { PUNTOS_POR_TIPO } from "@/config/gamificacion";
import { UMBRAL_EN_VIVO_MIN, VENTANA_PARADERO_H, VIGENCIA_REPORTE_MIN } from "@/config/reportes";
import { VELOCIDAD_MEDIA_KMH } from "@/config/simulacion";
import { destinosComunes, destinosRecientes } from "@/mocks/busquedas";
import { destinos } from "@/mocks/destinos";
import { lineasFavoritas, paraderosFavoritos } from "@/mocks/favoritos";
import { insignias } from "@/mocks/insignias";
import { lineas, rutasPorDestino } from "@/mocks/lineas";
import { lugaresGuardados } from "@/mocks/lugares";
import { notificaciones as notificacionesIniciales } from "@/mocks/notificaciones";
import { paraderos } from "@/mocks/paraderos";
import { reportes } from "@/mocks/reportes";
import { ubicacionUsuario, usuario } from "@/mocks/usuario";
import { vias } from "@/mocks/vias";
import type {
  ActividadParadero,
  AlertaDiaria,
  BorradorReporte,
  Coordenada,
  DatosAlerta,
  Destino,
  Favoritos,
  Insignia,
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
  UnidadEnCamino,
  UnidadEnVivo,
  Usuario,
  Via,
  ViajeAlerta,
} from "@/types";
import { distanciaMetros } from "@/utils/geo";

const RADIO_CERCANO_M = 2000;
// Un lugar guardado usa las rutas del destino conocido más cercano dentro de este radio // supuesto
const RADIO_LUGAR_M = 5000;

// Simula la latencia de red (300–600 ms)
const esperar = () => new Promise<void>((resolve) => setTimeout(resolve, 300 + Math.random() * 300));

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

// Favoritas en memoria: duran mientras la app está abierta.
// Fase 5: se guardan por usuario en Supabase.
const favoritas = new Set(lineasFavoritas);

export async function esFavorita(lineaId: string): Promise<boolean> {
  await esperar();
  return favoritas.has(lineaId);
}

// Marca o desmarca la línea y devuelve el estado nuevo (true = favorita).
export async function alternarFavorita(lineaId: string): Promise<boolean> {
  await esperar();
  if (favoritas.has(lineaId)) {
    favoritas.delete(lineaId);
    return false;
  }
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

// Favoritos en memoria, igual que las líneas favoritas.
// Fase 5: se guardan por usuario en Supabase.
const paraderosMarcados = new Set(paraderosFavoritos);

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
    paraderosMarcados.delete(paraderoId);
    return false;
  }
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
export async function buscarRutas(origen: string, destino: string): Promise<OpcionRuta[]> {
  await esperar();
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
  await esperar();
  return reportes
    .filter((reporte) => distanciaMetros(lat, lng, reporte.lat, reporte.lng) <= RADIO_CERCANO_M)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

export async function getLugaresGuardados(): Promise<LugarGuardado[]> {
  await esperar();
  return lugaresGuardados;
}

// Fase 6: se reemplaza por la ubicación real del celular.
export async function getUbicacionUsuario(): Promise<Coordenada> {
  await esperar();
  return ubicacionUsuario;
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
  await esperar();
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
  await esperar();
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
  await esperar();
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

// Usuario en memoria: los puntos ganados duran mientras la app está abierta.
// Fase 5: sale del perfil del usuario autenticado en Supabase.
let usuarioActual: Usuario = { ...usuario };

export async function getUsuario(): Promise<Usuario> {
  await esperar();
  return usuarioActual;
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
  await esperar();
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
  await esperar();
  const consulta = normalizar(texto);
  return lineas
    .filter((linea) => [linea.codigo, linea.nombre, linea.empresa].some((campo) => normalizar(campo).includes(consulta)))
    .map((linea) => sugerir(linea, ubicacionUsuario.lat, ubicacionUsuario.lng));
}

// Tipos de reporte que se asocian al paradero más cercano
const TIPOS_EN_PARADERO: Reporte["tipo"][] = ["paradero", "seguridad"];

// Guarda el reporte en memoria y suma los puntos al usuario.
export async function crearReporte(borrador: BorradorReporte): Promise<ResultadoReporte> {
  await esperar();
  const { tipo } = borrador;
  if (!tipo) {
    throw new Error("El reporte no tiene tipo");
  }
  const { lat, lng } = borrador.posicion ?? ubicacionUsuario;

  const reporte: Reporte = {
    id: `r${Date.now()}`,
    tipo,
    usuarioId: usuarioActual.id,
    lineaId: borrador.lineaId,
    paraderoId: TIPOS_EN_PARADERO.includes(tipo)
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
    // Fase 5: se sube a Supabase Storage y se guarda la URL
    fotoUri: borrador.fotoUri,
    creadoEn: new Date().toISOString(),
    confirmaciones: 1,
  };
  reportes.push(reporte);

  const puntosGanados = PUNTOS_POR_TIPO[tipo];
  usuarioActual = {
    ...usuarioActual,
    puntos: usuarioActual.puntos + puntosGanados,
    reportesMes: usuarioActual.reportesMes + 1,
  };

  return {
    reporte,
    puntosGanados,
    usuario: usuarioActual,
    // supuesto: hasta tener Realtime, un número creíble de pasajeros cerca
    personasQueLoVen: 20 + Math.floor(Math.random() * 41),
  };
}

// Reportes de seguridad de las últimas `horas`, del más reciente al más
// antiguo (mapa de seguridad, F3_06). Los anónimos no dicen quién los envió.
export async function getReportesSeguridad(horas: number): Promise<Reporte[]> {
  await esperar();
  return reportes
    .filter((reporte) => reporte.tipo === "seguridad" && minutosDesde(reporte.creadoEn) <= horas * 60)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
    .map((reporte) => (reporte.anonimo ? { ...reporte, usuarioId: undefined } : reporte));
}

// Reportes del usuario, del más reciente al más antiguo (F2_09).
export async function getHistorialReportes(): Promise<ReporteHistorial[]> {
  await esperar();
  return reportes
    .filter((reporte) => reporte.usuarioId === usuarioActual.id)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
    .map((reporte) => ({
      reporte,
      linea: lineas.find((l) => l.id === reporte.lineaId),
      puntos: PUNTOS_POR_TIPO[reporte.tipo],
      vencido: minutosDesde(reporte.creadoEn) > VIGENCIA_REPORTE_MIN,
    }));
}

export async function getInsignias(): Promise<Insignia[]> {
  await esperar();
  return insignias;
}

// Alertas en memoria: duran mientras la app está abierta y empiezan vacías.
// Fase 5: se guardan por usuario en Supabase y las dispara el servidor.
const alertas: AlertaDiaria[] = [];

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
  const alerta: AlertaDiaria = { ...datos, id: datos.id ?? `a${Date.now()}` };
  const i = alertas.findIndex((a) => a.id === alerta.id);
  if (i === -1) {
    alertas.push(alerta);
  } else {
    alertas[i] = alerta;
  }
  return alerta;
}

export async function eliminarAlerta(id: string): Promise<void> {
  await esperar();
  const i = alertas.findIndex((alerta) => alerta.id === id);
  if (i !== -1) {
    alertas.splice(i, 1);
  }
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
  await esperar();
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
      const paradero = masCercano(ubicacionUsuario.lat, ubicacionUsuario.lng, recorrido);
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
  await esperar();

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

  return { lugares: lugaresGuardados, paraderos: favoritos, rutas };
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

// Notificaciones en memoria: duran mientras la app está abierta.
// Fase 5: se guardan por usuario en Supabase y llegan por Realtime / push.
const notificaciones: Notificacion[] = notificacionesIniciales.map((n) => ({ ...n }));

// De la más reciente a la más antigua
export async function getNotificaciones(): Promise<Notificacion[]> {
  await esperar();
  return [...notificaciones].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export async function marcarNotificacionLeida(id: string): Promise<void> {
  await esperar();
  const notificacion = notificaciones.find((n) => n.id === id);
  if (notificacion) {
    notificacion.leida = true;
  }
}

export async function contarNoLeidas(): Promise<number> {
  await esperar();
  return notificaciones.filter((n) => !n.leida).length;
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
  const notificacion: Notificacion = {
    id: `n${Date.now()}`,
    tipo: "llegada",
    titulo: `¡Tu combi habitual está a ${alerta.minutosAntes} min del paradero!`,
    detalle: `${linea.nombre} · ${paradero.nombre}`,
    fecha: new Date().toISOString(),
    leida: false,
    lineaId: linea.id,
    paraderoId: paradero.id,
    alertaId: alerta.id,
  };
  notificaciones.push(notificacion);
  return notificacion;
}
