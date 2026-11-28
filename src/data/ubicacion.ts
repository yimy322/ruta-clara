// Ubicación del usuario (6.1): GPS del celular en primer plano (expo-location)
// o la ubicación de prueba de los mocks (Puente Nuevo, El Agustino), para que
// la demo muestre los datos de ejemplo aunque se esté lejos (decisión 65).
// Separado del repositorio como preferencias.ts; las pantallas siguen usando
// getUbicacionUsuario() del repositorio.
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

import { ubicacionUsuario as ubicacionPrueba } from "@/mocks/usuario";
import type { Coordenada } from "@/types";

const CLAVE_PRUEBA = "rutaclara:ubicacionPrueba";
// Una posición más nueva que esto se reutiliza (una pantalla pide varias veces)
const MEMORIA_MS = 30_000;
// Última posición conocida aceptable al pedirla
const ANTIGUEDAD_MAXIMA_MS = 60_000;

// Encendida por defecto; no depende de __DEV__ para que una build de demo
// también la use
let usarPrueba = true;
const lectura = AsyncStorage.getItem(CLAVE_PRUEBA)
  .then((valor) => {
    if (valor !== null) usarPrueba = valor === "1";
  })
  .catch(() => {});

let ultima: { coordenada: Coordenada; en: number } | null = null;

export async function getUsarUbicacionPrueba(): Promise<boolean> {
  await lectura;
  return usarPrueba;
}

export async function setUsarUbicacionPrueba(valor: boolean): Promise<void> {
  await lectura;
  usarPrueba = valor;
  ultima = null;
  await AsyncStorage.setItem(CLAVE_PRUEBA, valor ? "1" : "0").catch(() => {});
}

// Sin permiso (lo pide el banner de F1_04, no esta función) o sin GPS se usa
// la ubicación de prueba: la app nunca queda sin ubicación
export async function obtenerUbicacion(): Promise<Coordenada> {
  await lectura;
  if (usarPrueba) {
    return ubicacionPrueba;
  }
  if (ultima && Date.now() - ultima.en < MEMORIA_MS) {
    return ultima.coordenada;
  }
  try {
    const { granted } = await Location.getForegroundPermissionsAsync();
    if (!granted) {
      return ultima?.coordenada ?? ubicacionPrueba;
    }
    const posicion =
      (await Location.getLastKnownPositionAsync({ maxAge: ANTIGUEDAD_MAXIMA_MS })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    const coordenada = { lat: posicion.coords.latitude, lng: posicion.coords.longitude };
    ultima = { coordenada, en: Date.now() };
    return coordenada;
  } catch {
    return ultima?.coordenada ?? ubicacionPrueba;
  }
}
