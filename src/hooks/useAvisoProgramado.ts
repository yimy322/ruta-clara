import { useEffect } from "react";

import { cancelarAviso, programarAviso } from "@/data/notificacionesLocales";

// Notificación local para cuando la app no se ve (6.3): con `segundos` la
// programa y la cancela si cambian los datos, si `segundos` pasa a null o al
// salir de la pantalla. Pasar a segundo plano no desmonta la pantalla, así que
// el último aviso programado sigue en pie.
export function useAvisoProgramado(id: string, segundos: number | null, titulo: string, cuerpo: string) {
  useEffect(() => {
    if (segundos === null) {
      return;
    }
    void programarAviso(id, { titulo, cuerpo }, segundos);
    return () => {
      void cancelarAviso(id);
    };
  }, [id, segundos, titulo, cuerpo]);
}
