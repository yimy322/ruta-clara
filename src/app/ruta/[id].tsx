import { useLocalSearchParams, useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components";

export default function DetalleRuta() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      title="F1_07 · Detalle de ruta"
      subtitle={`Ruta ${id}`}
      actions={[{ label: "Esperar unidad", onPress: () => router.push("/viaje/espera") }]}
    />
  );
}
