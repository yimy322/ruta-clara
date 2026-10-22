import { useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components";

export default function FinViaje() {
  const router = useRouter();

  // Cierra el modal y todo el stack del viaje, volviendo a Inicio.
  const handleClose = () => {
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.navigate("/");
  };

  return (
    <PlaceholderScreen
      title="F1_10 · Finalización del viaje"
      actions={[{ label: "Cerrar", onPress: handleClose }]}
    />
  );
}
