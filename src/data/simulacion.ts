// Modo de prueba (solo desarrollo): fuerza estados de error, vacío y sin
// conexión para revisar E1–E10 sin tocar los mocks. Vive en memoria y se
// cambia desde /dev/datos. Fase 5: se elimina junto con los mocks.
export type Simulacion = {
  // buscarRutas falla como si el servicio no respondiera (E7)
  forzarError: boolean;
  // Favoritos, historial y avisos vuelven vacíos (E4, E5, E6)
  forzarVacio: boolean;
  // crearReporte falla como sin conexión (E3)
  forzarSinRed: boolean;
};

let simulacion: Simulacion = { forzarError: false, forzarVacio: false, forzarSinRed: false };

export const getSimulacion = (): Simulacion => (__DEV__ ? simulacion : { forzarError: false, forzarVacio: false, forzarSinRed: false });

export function setSimulacion(cambios: Partial<Simulacion>) {
  simulacion = { ...simulacion, ...cambios };
}

// Error de red: el reporte se guarda en la cola para enviarlo después (E3)
export class SinConexionError extends Error {
  constructor() {
    super("Sin conexión");
    this.name = "SinConexionError";
  }
}
