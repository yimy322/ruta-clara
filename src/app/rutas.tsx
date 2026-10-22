import { useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components";

export default function Rutas() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="F1_06 · Resultados de rutas"
      actions={[{ label: "Ver La 50", onPress: () => router.push("/ruta/La50") }]}
    />
  );
}
