import { Stack, useNavigation } from "expo-router";
import { useCallback } from "react";

import { ReporteProvider } from "@/context/ReporteContext";

// Pasos del reporte dentro del modal /reporte. router.dismissAll() solo
// volvería al primer paso de este stack; en el layout, useNavigation() apunta
// a la pantalla "reporte" del stack raíz, así que goBack() cierra el modal.
export default function ReporteLayout() {
  const navigation = useNavigation();
  const cerrar = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <ReporteProvider onCerrar={cerrar}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* El reporte ya se envió: no se vuelve atrás con el gesto */}
        <Stack.Screen name="gracias" options={{ gestureEnabled: false }} />
      </Stack>
    </ReporteProvider>
  );
}
