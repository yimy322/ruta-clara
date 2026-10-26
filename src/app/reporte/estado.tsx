import { PlaceholderScreen } from "@/components";
import { useReporte } from "@/context/ReporteContext";

// PROVISIONAL: se maqueta en el siguiente paso de la Fase 4
export default function ReporteEstado() {
  const { cerrar } = useReporte();

  return <PlaceholderScreen title="F2_03 · Estado del carro" actions={[{ label: "Cerrar", variant: "secondary", onPress: cerrar }]} />;
}
