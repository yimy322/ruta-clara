import { Tabs, useRouter } from "expo-router";
import type { BottomTabBarProps } from "expo-router/tabs";

import { BottomNav, type BottomNavTab } from "@/components";

// Nombre de ruta (archivo en /(tabs)) ↔ clave del componente BottomNav.
const ROUTE_TO_TAB: Record<string, BottomNavTab> = {
  index: "inicio",
  favoritos: "favoritos",
  reportar: "reportar",
  alertas: "alertas",
  perfil: "perfil",
};

// Adapta el tabBar de Expo Router a BottomNav. Emite tabPress igual que la
// barra por defecto, para que los listeners puedan hacer preventDefault.
function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const activeRoute = state.routes[state.index];

  const handleSelect = (tab: BottomNavTab) => {
    const route = state.routes.find((r) => ROUTE_TO_TAB[r.name] === tab);
    if (!route) {
      return;
    }
    const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (route.key !== activeRoute.key && !event.defaultPrevented) {
      navigateToTab(route.key);
    }
  };

  return <BottomNav active={ROUTE_TO_TAB[activeRoute.name] ?? "inicio"} onSelect={handleSelect} />;
}

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="favoritos" />
      <Tabs.Screen
        name="reportar"
        listeners={{
          // "Reportar" no es una pantalla: abre el modal de reporte.
          tabPress: (e) => {
            e.preventDefault();
            router.push("/reporte");
          },
        }}
      />
      <Tabs.Screen name="alertas" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
