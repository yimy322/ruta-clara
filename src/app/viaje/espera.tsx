import { useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components";

export default function Espera() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="F1_08 · Monitoreo en vivo"
      actions={[{ label: "Ya subí", onPress: () => router.push("/viaje/a-bordo") }]}
    />
  );
}
