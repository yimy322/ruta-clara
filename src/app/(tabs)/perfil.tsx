import { useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components";
import { usePreferencias } from "@/context/PreferenciasContext";

export default function Perfil() {
  const router = useRouter();
  const { reiniciarOnboarding } = usePreferencias();

  return (
    <PlaceholderScreen
      title="F2_09 · Historial y logros"
      edges={["left", "right"]}
      actions={[
        { label: "Ver catálogo", variant: "tertiary", onPress: () => router.push("/dev/catalogo") },
        { label: "Ver datos", variant: "tertiary", onPress: () => router.push("/dev/datos") },
        // Vuelve al primer uso: Stack.Protected redirige a /onboarding
        { label: "Reiniciar onboarding", variant: "tertiary", onPress: reiniciarOnboarding },
      ]}
    />
  );
}
