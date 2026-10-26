// Capa de acceso a datos. Las pantallas solo leen datos desde aquí.
// Fase 5: se reemplaza por consultas a Supabase sin cambiar las firmas.
import { PUNTOS_POR_TIPO } from "@/config/gamificacion";
import { VELOCIDAD_MEDIA_KMH } from "@/config/simulacion";
import { destinosComunes, destinosRecientes } from "@/mocks/busquedas";
import { destinos } from "@/mocks/destinos";
import { lineasFavoritas } from "@/mocks/favoritos";
import { lineas, rutasPorDestino } from "@/mocks/lineas";
import { lugaresGuardados } from "@/mocks/lugares";
import { paraderos } from "@/mocks/paraderos";
import { reportes } from "@/mocks/reportes";
import { ubicacionUsuario, usuario } from "@/mocks/usuario";
import type {
  BorradorReporte,
  Coordenada,
  Destino,
  Linea,
  LineaSugerida,
  LugarGuardado,
  OpcionRuta,
  Paradero,
  ParaderoTramo,
  Reporte,
  ResultadoReporte,
  ResumenParadero,
  Sentido,
  UnidadEnCamino,
  UnidadEnVivo,
  Usuario,
} from "@/types";
import { distanciaMetros } from "@/utils/geo";

// Un reporte deja de contar como activo después de este tiempo
const VIGENCIA_REPORTE_MIN = 30;
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

function paraderoMasCercano(lat: number, lng: number): Paradero | null {
  let cercano: Paradero | null = null;
  let menor = Infinity;
  for (const paradero of paraderos) {
    const distancia = distanciaMetros(lat, lng, paradero.lat, paradero.lng);
    if (distancia < menor) {
      menor = distancia;
      cercano = paradero;
    }
  }
  return cercano;
}

export async function getParaderoCercano(lat: number, lng: number): Promise<Paradero | null> {
  await esperar();
  return paraderoMasCercano(lat, lng);
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

export async function getParaderosCercanos(lat: number, lng: number): Promise<Paradero[]> {
  await esperar();
  return paraderos.filter((paradero) => distanciaMetros(lat, lng, paradero.lat, paradero.lng) <= RADIO_CERCANO_M);
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
export async function getResumenParadero(paraderoId: string): Promise<ResumenParadero> {
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

// Unidad de la línea más próxima al paradero, según su último reporte de
// ubicación vigente; null si no hay. La ETA sale de la distancia en línea
// recta a velocidad media.
export async function getUnidadEnCamino(lineaId: string, paraderoId: string): Promise<UnidadEnCamino | null> {
  await esperar();
  const linea = lineas.find((l) => l.id === lineaId);
  const paradero = paraderos.find((p) => p.id === paraderoId);
  const reporte = reportes
    .filter((r) => r.tipo === "ubicacion" && r.lineaId === lineaId && minutosDesde(r.creadoEn) <= VIGENCIA_REPORTE_MIN)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))[0];
  if (!linea || !paradero || !reporte) {
    return null;
  }
  const distanciaM = distanciaMetros(reporte.lat, reporte.lng, paradero.lat, paradero.lng);
  return {
    linea,
    lat: reporte.lat,
    lng: reporte.lng,
    distanciaM,
    etaMin: Math.max(Math.round(minutosEnRecorrer(distanciaM)), 1),
    ocupacion: reporte.ocupacion,
    velocidad: reporte.velocidad,
    pasajeros: reporte.confirmaciones,
    actualizadoEn: reporte.creadoEn,
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
    lineaId: borrador.lineaId,
    paraderoId: TIPOS_EN_PARADERO.includes(tipo) ? paraderoMasCercano(lat, lng)?.id : undefined,
    lat,
    lng,
    ocupacion: borrador.ocupacion,
    velocidad: borrador.velocidad,
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
