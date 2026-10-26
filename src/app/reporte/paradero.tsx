import { PlaceholderScreen } from "@/components";
import { useReporte } from "@/context/ReporteContext";

// PROVISIONAL: se maqueta en el siguiente paso de la Fase 4
export default function ReporteParadero() {
  const { cerrar } = useReporte();

  return <PlaceholderScreen title="F2_05 · Espera en paradero" actions={[{ label: "Cerrar", variant: "secondary", onPress: cerrar }]} />;
}
