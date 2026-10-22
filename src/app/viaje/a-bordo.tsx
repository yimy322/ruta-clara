import { useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components";

export default function ABordo() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="F1_09 · En tránsito (a bordo)"
      actions={[{ label: "Terminar viaje", onPress: () => router.push("/viaje/fin") }]}
    />
  );
}
