import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { useColaReportes } from "@/context/ColaReportesContext";
import { crearReporte } from "@/data/repositorio";
import { SinConexionError } from "@/data/simulacion";
import type { BorradorReporte } from "@/types";

// Envía el reporte y abre el agradecimiento (F2_08). Sin conexión, lo guarda
// en la cola y abre E3 (se enviará solo al volver la señal). Si falla por
// otra razón, ofrece reintentar; lo ingresado sigue en el borrador.
export function useEnviarReporte() {
  const router = useRouter();
  const { encolar } = useColaReportes();
  const [enviando, setEnviando] = useState(false);

  const guardarSinConexion = async (borrador: BorradorReporte) => {
    const item = await encolar(borrador);
    router.push({ pathname: "/reporte/sin-conexion", params: { id: item.id } });
  };

  const enviar = async (borrador: BorradorReporte) => {
    setEnviando(true);
    try {
      const red = await NetInfo.fetch();
      // isConnected es null mientras no se sabe: en ese caso se intenta enviar
      if (red.isConnected === false) {
        await guardarSinConexion(borrador);
        return;
      }
      const resultado = await crearReporte(borrador);
      router.push({
        pathname: "/reporte/gracias",
        params: {
          puntos: resultado.puntosGanados,
          total: resultado.usuario.puntos,
          personas: resultado.personasQueLoVen,
        },
      });
    } catch (error) {
      if (error instanceof SinConexionError) {
        await guardarSinConexion(borrador);
        return;
      }
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
