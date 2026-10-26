import { PlaceholderScreen } from "@/components";
import { useReporte } from "@/context/ReporteContext";

// PROVISIONAL: se maqueta en el siguiente paso de la Fase 4
export default function ReporteSeguridad() {
  const { cerrar } = useReporte();

  return <PlaceholderScreen title="F2_07 · Reporte de seguridad" actions={[{ label: "Cerrar", variant: "secondary", onPress: cerrar }]} />;
}
