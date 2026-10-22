import { useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components";

export default function Reporte() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="F2_01 · Panel de reporte rápido"
      actions={[{ label: "Cerrar", variant: "secondary", onPress: () => router.back() }]}
    />
  );
}
