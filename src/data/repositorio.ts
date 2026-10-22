// Capa de acceso a datos. Las pantallas solo leen datos desde aquí.
// Fase 5: se reemplaza por consultas a Supabase sin cambiar las firmas.
import { destinos } from "@/mocks/destinos";
import { lineas, rutasPorDestino } from "@/mocks/lineas";
import { lugaresGuardados } from "@/mocks/lugares";
import { paraderos } from "@/mocks/paraderos";
import { reportes } from "@/mocks/reportes";
import type { Destino, Linea, LugarGuardado, OpcionRuta, Paradero, Reporte } from "@/types";

// Un reporte deja de contar como activo después de este tiempo
const VIGENCIA_REPORTE_MIN = 30;
const RADIO_CERCANO_M = 2000;

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

// Distancia en metros entre dos coordenadas (haversine)
function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6_371_000;
  const rad = (grados: number) => (grados * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

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

// `origen` todavía no se usa: por ahora siempre es "Mi ubicación".
export async function buscarRutas(origen: string, destino: string): Promise<OpcionRuta[]> {
  await esperar();
  const encontrado = destinos.find((d) => normalizar(d.nombre) === normalizar(destino));
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
