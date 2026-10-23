// Capa de acceso a datos. Las pantallas solo leen datos desde aquí.
// Fase 5: se reemplaza por consultas a Supabase sin cambiar las firmas.
import { destinosComunes, destinosRecientes } from "@/mocks/busquedas";
import { destinos } from "@/mocks/destinos";
import { lineas, rutasPorDestino } from "@/mocks/lineas";
import { lugaresGuardados } from "@/mocks/lugares";
import { paraderos } from "@/mocks/paraderos";
import { reportes } from "@/mocks/reportes";
import { ubicacionUsuario } from "@/mocks/usuario";
import type {
  Coordenada,
  Destino,
  Linea,
  LugarGuardado,
  OpcionRuta,
  Paradero,
  Reporte,
  ResumenParadero,
  UnidadEnVivo,
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

export async function getParaderoCercano(lat: number, lng: number): Promise<Paradero | null> {
  await esperar();
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
