import { PlaceholderScreen } from "@/components";
import { usePreferencias } from "@/context/PreferenciasContext";

// Provisional: la pantalla real de primer uso se hace en la parte B.
export default function Onboarding() {
  const { completarOnboarding } = usePreferencias();

  return (
    <PlaceholderScreen
      title="Onboarding (provisional)"
      actions={[{ label: "Terminar", onPress: completarOnboarding }]}
    />
  );
}
