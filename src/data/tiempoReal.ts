// Tiempo real (5.5): un solo canal de Supabase Realtime sobre la tabla
// reportes, compartido por las pantallas que muestran reportes
// (useReportesEnVivo). Se abre con el primer oyente, se cierra con el último
// y también al pasar a segundo plano.
import { AppState } from "react-native";

import { invalidarReportes } from "./repositorio";
import { supabase } from "./supabase";

type Oyente = () => void;
type Canal = ReturnType<typeof supabase.channel>;

// Junta varios cambios seguidos («Refrescar» actualiza 15 filas) en un aviso
const ESPERA_AVISO_MS = 500;

const oyentes = new Set<Oyente>();
let canal: Canal | null = null;
let temporizador: ReturnType<typeof setTimeout> | null = null;
// Sube con cada cambio; una pantalla que vuelve a verse compara con la suya
let version = 0;
let enPrimerPlano = AppState.currentState === "active";

export const getVersionReportes = () => version;

function avisar() {
  invalidarReportes();
  if (temporizador) {
    clearTimeout(temporizador);
  }
  temporizador = setTimeout(() => {
    temporizador = null;
    version += 1;
    oyentes.forEach((oyente) => oyente());
  }, ESPERA_AVISO_MS);
}

function abrir() {
  if (canal || !enPrimerPlano || oyentes.size === 0) {
    return;
  }
  canal = supabase
    .channel("reportes-en-vivo")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "reportes" }, avisar)
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "reportes" }, avisar)
    .subscribe();
}

function cerrar() {
  if (canal) {
    void supabase.removeChannel(canal);
    canal = null;
  }
}

AppState.addEventListener("change", (estado) => {
  const activo = estado === "active";
  if (activo === enPrimerPlano) {
    return;
  }
  enPrimerPlano = activo;
  if (activo) {
    abrir();
    // Pudo llegar algo mientras la app no se veía
    if (oyentes.size > 0) {
      avisar();
    }
  } else {
    cerrar();
  }
});

// Avisa cada vez que se crea o cambia un reporte. Devuelve la función para
// dejar de escuchar.
export function escucharReportes(alCambiar: Oyente): () => void {
  oyentes.add(alCambiar);
  abrir();
  return () => {
    oyentes.delete(alCambiar);
    if (oyentes.size === 0) {
      cerrar();
    }
  };
}
