import { useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components";

export default function Inicio() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="F1_04 · Inicio — Principal"
      edges={["left", "right"]}
      actions={[
        { label: "Buscar destino", onPress: () => router.push("/buscar") },
        { label: "Ver catálogo", variant: "tertiary", onPress: () => router.push("/dev/catalogo") },
      ]}
    />
  );
}
