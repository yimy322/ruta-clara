import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { PantallaCarga, ToastProvider } from "@/components";
import { ColaReportesProvider } from "@/context/ColaReportesContext";
import { NotificacionesProvider } from "@/context/NotificacionesContext";
import { PreferenciasProvider, usePreferencias } from "@/context/PreferenciasContext";
import { TemaProvider, useTema } from "@/context/TemaContext";
import { ViajeProvider } from "@/context/ViajeContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <PreferenciasProvider>
      <TemaProvider>
        <ViajeProvider>
          <NotificacionesProvider>
            <ToastProvider>
              <ColaReportesProvider>
                <RootNavigator />
              </ColaReportesProvider>
            </ToastProvider>
          </NotificacionesProvider>
        </ViajeProvider>
      </TemaProvider>
    </PreferenciasProvider>
  );
}

function RootNavigator() {
  const { esquema } = useTema();
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const { onboardingVisto } = usePreferencias();
  const fuentesListas = loaded || !!error;

  // El splash nativo cubre la carga de fuentes; después PantallaCarga
  // (F1_01) cubre el resto, con duración mínima de 1,5 s.
  useEffect(() => {
    if (fuentesListas) {
      SplashScreen.hideAsync();
    }
  }, [fuentesListas]);

  if (!fuentesListas) {
    return null;
  }

  if (onboardingVisto === null) {
    return <PantallaCarga />;
  }

  // Sin header nativo: cada pantalla usa nuestro componente Header.
  // Todas las rutas se declaran para que ninguna quede fuera de la protección.
  return (
    <>
      {/* Barra de estado según el tema: texto claro sobre el fondo oscuro */}
      <StatusBar style={esquema === "oscuro" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!onboardingVisto}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={onboardingVisto}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="buscar" />
          <Stack.Screen name="rutas" />
          <Stack.Screen name="ruta/[id]" />
          <Stack.Screen name="paradero/[id]" />
          <Stack.Screen name="viaje/espera" />
          <Stack.Screen name="viaje/a-bordo" />
          <Stack.Screen name="viaje/fin" options={{ presentation: "fullScreenModal" }} />
          <Stack.Screen name="reporte" options={{ presentation: "modal" }} />
          <Stack.Screen name="alerta" options={{ presentation: "modal" }} />
          <Stack.Screen name="ajustes" />
          <Stack.Screen name="accesibilidad" />
          <Stack.Screen name="seguridad" />
          <Stack.Screen name="dev/catalogo" />
          <Stack.Screen name="dev/datos" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
