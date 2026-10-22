import { useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components";

export default function Buscar() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="F1_05 · Búsqueda de destino"
      actions={[{ label: "Ver rutas", onPress: () => router.push("/rutas") }]}
    />
  );
}
