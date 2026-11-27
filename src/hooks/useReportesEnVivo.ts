import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { escucharReportes, getVersionReportes } from "@/data/tiempoReal";

// Recarga en tiempo real (5.5): devuelve un número que sube cada vez que se
// crea o cambia un reporte, para ponerlo en las dependencias del efecto que
// carga los datos. También acepta un callback. Solo escucha mientras la
// pantalla se ve; al volver a verse, sube si hubo cambios mientras tanto.
export function useReportesEnVivo(alCambiar?: () => void) {
  const [version, setVersion] = useState(0);
  const callback = useRef(alCambiar);
  const vista = useRef(getVersionReportes());

  useEffect(() => {
    callback.current = alCambiar;
  }, [alCambiar]);

  useFocusEffect(
    useCallback(() => {
      const subir = () => {
        vista.current = getVersionReportes();
        setVersion((n) => n + 1);
      };
      // Al volver a verse solo sube la versión: quien usa el callback ya
      // recarga al recibir foco
      if (getVersionReportes() !== vista.current) {
        subir();
      }
      return escucharReportes(() => {
        subir();
        callback.current?.();
      });
    }, []),
  );

  return version;
}
