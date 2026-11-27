import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Destino, Linea, Paradero, RutaDestino, Via } from "@/types";

import { SinConexionError } from "./simulacion";
import { supabase } from "./supabase";

// Catálogo (líneas, paraderos, destinos, vías, búsquedas y rutas por
// destino). Se lee de Supabase una vez y queda en memoria; el repositorio
// usa estos mismos arreglos (se rellenan en su lugar). Sin red, se usa la
// última copia guardada en el teléfono.
export const lineas: Linea[] = [];
export const paraderos: Paradero[] = [];
export const destinos: Destino[] = [];
export const vias: Via[] = [];
export const destinosRecientes: string[] = [];
export const destinosComunes: string[] = [];
export const rutasPorDestino: Record<string, RutaDestino[]> = {};

type Catalogo = {
  lineas: Linea[];
  paraderos: Paradero[];
  destinos: Destino[];
  vias: Via[];
  destinosRecientes: string[];
  destinosComunes: string[];
  rutasPorDestino: Record<string, RutaDestino[]>;
};

const CLAVE_COPIA = "catalogo:v1";

let carga: Promise<void> | null = null;

// Resuelve cuando el catálogo está en memoria. Si falla, la próxima
// llamada vuelve a intentar.
export function cargarCatalogo(): Promise<void> {
  carga ??= cargar().catch((error: unknown) => {
    carga = null;
    throw error;
  });
  return carga;
}

async function cargar() {
  let catalogo: Catalogo;
  try {
    catalogo = await descargar();
    void AsyncStorage.setItem(CLAVE_COPIA, JSON.stringify(catalogo)).catch(() => {});
  } catch (error) {
    const copia = await AsyncStorage.getItem(CLAVE_COPIA).catch(() => null);
    if (!copia) {
      throw error instanceof SinConexionError ? error : new SinConexionError();
    }
    catalogo = JSON.parse(copia) as Catalogo;
  }
  aplicar(catalogo);
}

function aplicar(catalogo: Catalogo) {
  lineas.splice(0, lineas.length, ...catalogo.lineas);
  paraderos.splice(0, paraderos.length, ...catalogo.paraderos);
  destinos.splice(0, destinos.length, ...catalogo.destinos);
  vias.splice(0, vias.length, ...catalogo.vias);
  destinosRecientes.splice(0, destinosRecientes.length, ...catalogo.destinosRecientes);
  destinosComunes.splice(0, destinosComunes.length, ...catalogo.destinosComunes);
  for (const clave of Object.keys(rutasPorDestino)) {
    delete rutasPorDestino[clave];
  }
  Object.assign(rutasPorDestino, catalogo.rutasPorDestino);
}

// Filas tal como vienen de Postgres (snake_case)
type FilaLinea = {
  id: string;
  codigo: string;
  nombre: string;
  tipo: Linea["tipo"];
  empresa: string;
  tramo: string;
  pasaje: number;
  frecuencia_min: number;
  horario: string;
  recorrido_ida: string[];
  recorrido_vuelta: string[];
  afluencia: number[];
  suspendida: boolean;
};

type FilaRuta = {
  destino_id: string;
  linea_id: string;
  eta_min: number;
  trafico: RutaDestino["trafico"];
  reportes_activos: number;
  ocupacion: RutaDestino["ocupacion"] | null;
};

async function descargar(): Promise<Catalogo> {
  const [rLineas, rParaderos, rDestinos, rVias, rBusquedas, rRutas] = await Promise.all([
    supabase.from("lineas").select("*").order("orden"),
    supabase.from("paraderos").select("id, nombre, direccion, distrito, lat, lng").order("orden"),
    supabase.from("destinos").select("id, nombre, distrito, lat, lng").order("orden"),
    supabase.from("vias").select("id, nombre, referencia, lat, lng").order("orden"),
    supabase.from("busquedas").select("destino_id, tipo").order("orden"),
    supabase.from("rutas_destino").select("*").order("orden"),
  ]);

  const error =
    rLineas.error ?? rParaderos.error ?? rDestinos.error ?? rVias.error ?? rBusquedas.error ?? rRutas.error;
  if (error) {
    // supabase-js no lanza: un fallo de red llega como error sin código de Postgres
    throw error.code ? new Error(error.message) : new SinConexionError();
  }

  const busquedas = rBusquedas.data as { destino_id: string; tipo: "reciente" | "comun" }[];
  const rutas: Record<string, RutaDestino[]> = {};
  for (const fila of rRutas.data as FilaRuta[]) {
    (rutas[fila.destino_id] ??= []).push({
      lineaId: fila.linea_id,
      etaMin: fila.eta_min,
      trafico: fila.trafico,
      reportesActivos: fila.reportes_activos,
      ocupacion: fila.ocupacion ?? undefined,
    });
  }

  return {
    lineas: (rLineas.data as FilaLinea[]).map((fila) => ({
      id: fila.id,
      codigo: fila.codigo,
      nombre: fila.nombre,
      tipo: fila.tipo,
      empresa: fila.empresa,
      tramo: fila.tramo,
      pasaje: Number(fila.pasaje),
      frecuenciaMin: fila.frecuencia_min,
      horario: fila.horario,
      recorridoIda: fila.recorrido_ida,
      recorridoVuelta: fila.recorrido_vuelta,
      afluencia: fila.afluencia,
      ...(fila.suspendida && { suspendida: true }),
    })),
    paraderos: rParaderos.data as Paradero[],
    destinos: rDestinos.data as Destino[],
    vias: rVias.data as Via[],
    destinosRecientes: busquedas.filter((b) => b.tipo === "reciente").map((b) => b.destino_id),
    destinosComunes: busquedas.filter((b) => b.tipo === "comun").map((b) => b.destino_id),
    rutasPorDestino: rutas,
  };
}
