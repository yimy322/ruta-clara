import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { crearReporte } from "@/data/repositorio";
import type { BorradorReporte } from "@/types";

// Envía el reporte y abre el agradecimiento (F2_08). Si falla, ofrece
// reintentar; lo ingresado sigue en el borrador, así que no se pierde.
export function useEnviarReporte() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  const enviar = async (borrador: BorradorReporte) => {
    setEnviando(true);
    try {
      const resultado = await crearReporte(borrador);
      router.push({
        pathname: "/reporte/gracias",
        params: {
          puntos: resultado.puntosGanados,
          total: resultado.usuario.puntos,
          personas: resultado.personasQueLoVen,
        },
      });
    } catch {
      Alert.alert("No se pudo enviar", "Revisa tu conexión e inténtalo otra vez.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Reintentar", onPress: () => enviar(borrador) },
      ]);
    } finally {
      setEnviando(false);
    }
  };

  return { enviar, enviando };
}
