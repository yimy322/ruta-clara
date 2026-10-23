import { useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components";

export default function Perfil() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="F2_09 · Historial y logros"
      edges={["left", "right"]}
      actions={[
        { label: "Ver catálogo", variant: "tertiary", onPress: () => router.push("/dev/catalogo") },
        { label: "Ver datos", variant: "tertiary", onPress: () => router.push("/dev/datos") },
      ]}
    />
  );
}
