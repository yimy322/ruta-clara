import { Linking } from "react-native";

import { MENSAJE_SOPORTE, WHATSAPP_SOPORTE } from "@/config/soporte";

// Abre el chat de soporte en WhatsApp (o en el navegador si no está
// instalado). Devuelve false si no se pudo abrir.
export async function abrirWhatsApp(): Promise<boolean> {
  const url = `https://wa.me/${WHATSAPP_SOPORTE}?text=${encodeURIComponent(MENSAJE_SOPORTE)}`;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
