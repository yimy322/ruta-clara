// Cola de reportes sin enviar (E3). Si no hay conexión, el reporte se guarda
// en el dispositivo y se envía solo al volver la señal. Fase 5: la misma cola
// envía a Supabase.
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { BorradorReporte, ResultadoReporte } from "@/types";

import { CLAVE_COLA_REPORTES } from "./preferencias";
import { crearReporte } from "./repositorio";
import { SinConexionError } from "./simulacion";

export type ReporteEnCola = {
  id: string;
  borrador: BorradorReporte;
  // Fecha ISO en que se guardó
  guardadoEn: string;
};

export async function getCola(): Promise<ReporteEnCola[]> {
  try {
    const guardada = await AsyncStorage.getItem(CLAVE_COLA_REPORTES);
    return guardada ? (JSON.parse(guardada) as ReporteEnCola[]) : [];
  } catch {
    return [];
  }
}

async function guardarCola(cola: ReporteEnCola[]) {
  await AsyncStorage.setItem(CLAVE_COLA_REPORTES, JSON.stringify(cola));
}

export async function encolar(borrador: BorradorReporte): Promise<ReporteEnCola> {
  const item: ReporteEnCola = { id: `c${Date.now()}`, borrador, guardadoEn: new Date().toISOString() };
  await guardarCola([...(await getCola()), item]);
  return item;
}

// Envía los reportes en orden. Se detiene en el primero que falla por falta
// de conexión (los demás siguen en la cola). Devuelve los que se enviaron.
export async function enviarCola(): Promise<ResultadoReporte[]> {
  const cola = await getCola();
  const enviados: ResultadoReporte[] = [];
  let pendientes = cola;
  for (const item of cola) {
    try {
      enviados.push(await crearReporte(item.borrador));
      pendientes = pendientes.filter((p) => p.id !== item.id);
    } catch (error) {
      if (error instanceof SinConexionError) {
        break;
      }
      // Un reporte inválido no debe bloquear la cola: se descarta
      pendientes = pendientes.filter((p) => p.id !== item.id);
    }
  }
  await guardarCola(pendientes);
  return enviados;
}
