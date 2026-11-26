import { useRouter } from "expo-router";
import { Clock, ShieldCheck, X, type LucideIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button, PantallaCuenta, TarjetaCuenta } from "@/components";
import { DIAS_GRACIA_ELIMINACION } from "@/config/cuenta";
import { useEstilos, useTema } from "@/context/TemaContext";
import { getCuenta } from "@/data/repositorio";
import { radii, sizes, spacing, type Tema } from "@/theme";
import type { Cuenta } from "@/types";
import { formatearPuntos } from "@/utils/formato";
import { calcularRango } from "@/utils/gamificacion";

// D2 · Eliminar cuenta, paso 1 de 3: qué se elimina y qué se conserva.
export default function EliminarAdvertencia() {
  const router = useRouter();
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const [cuenta, setCuenta] = useState<Cuenta>();

  // Solo para los puntos y el rango; si falla se muestra un texto general
  useEffect(() => {
    getCuenta()
      .then(setCuenta)
      .catch(() => {});
  }, []);

  const puntos = cuenta
    ? `Tus ${formatearPuntos(cuenta.puntos)} puntos y el rango ${calcularRango(cuenta.puntos).actual.nombre}`
    : "Tus puntos y tu rango";

  return (
    <PantallaCuenta
      titulo="Eliminar cuenta"
      paso={1}
      pregunta="Antes de continuar, revisa qué pasará con tus datos"
      acciones={
        <>
          <Button label="Continuar" fullWidth onPress={() => router.push("/cuenta/eliminar/alternativa")} />
          <Button label="Cancelar" variant="tertiary" fullWidth onPress={() => router.back()} />
        </>
      }
    >
      <TarjetaCuenta titulo="Se elimina">
        <Item Icono={X} color={colors.redStrong} texto="Tu perfil y tus datos de contacto" />
        <Item Icono={X} color={colors.redStrong} texto={puntos} />
        <Item Icono={X} color={colors.redStrong} texto="Tu historial, favoritos y alertas" />
      </TarjetaCuenta>

      <TarjetaCuenta titulo="Se conserva">
        <Item
          Icono={ShieldCheck}
          color={colors.ink}
          texto="Tus reportes ya publicados, sin tu nombre, durante 12 meses para estadísticas de tránsito"
        />
        <Item
          Icono={ShieldCheck}
          color={colors.ink}
          texto="Un registro de esta solicitud durante 6 meses, por motivos legales"
        />
      </TarjetaCuenta>

      <View style={styles.aviso}>
        <Clock color={colors.ink} size={sizes.chevron} />
        <Text style={[typography.bodyStrong, styles.ink, styles.flex]}>
          Tendrás {DIAS_GRACIA_ELIMINACION} días para cambiar de opinión.
        </Text>
      </View>
    </PantallaCuenta>
  );
}

function Item({ Icono, color, texto }: { Icono: LucideIcon; color: string; texto: string }) {
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);

  return (
    <View style={styles.item}>
      <Icono color={color} size={sizes.chevron} />
      <Text style={[typography.body, styles.ink, styles.flex]}>{texto}</Text>
    </View>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    item: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm + spacing.xxs,
    },
    aviso: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm + spacing.xxs,
      paddingHorizontal: sizes.cardPadding,
      paddingVertical: spacing.md,
      borderRadius: radii.badge,
      backgroundColor: colors.yellowSoft,
    },
    flex: {
      flex: 1,
    },
    ink: {
      color: colors.ink,
    },
  });
