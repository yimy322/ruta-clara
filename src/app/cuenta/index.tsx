import { useFocusEffect, useRouter } from "expo-router";
import { ChevronRight, Clock, Download, Trash, UserRound, type LucideIcon } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Button, PantallaCuenta, TarjetaCuenta, useToast } from "@/components";
import { useEstilos, useTema } from "@/context/TemaContext";
import { cancelarEliminacion, getCuenta } from "@/data/repositorio";
import { opacity, radii, sizes, spacing, type Tema } from "@/theme";
import type { Cuenta } from "@/types";
import { formatearFechaLarga, formatearPuntos } from "@/utils/formato";
import { calcularRango } from "@/utils/gamificacion";

// undefined = cargando; null = error
type Estado = Cuenta | null | undefined;

// D1 · Mi cuenta: datos de la cuenta y privacidad (descargar datos,
// desactivar o eliminar). Desde la fila de perfil de Ajustes.
export default function MiCuenta() {
  const router = useRouter();
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const { mostrar } = useToast();

  const [cuenta, setCuenta] = useState<Estado>();
  const [cancelando, setCancelando] = useState(false);

  const pedirCuenta = useCallback(() => {
    let activo = true;
    getCuenta()
      .then((data) => activo && setCuenta(data))
      .catch(() => activo && setCuenta(null));
    return () => {
      activo = false;
    };
  }, []);

  // Recarga al volver del flujo de eliminación
  useFocusEffect(pedirCuenta);

  const reintentar = () => {
    setCuenta(undefined);
    pedirCuenta();
  };

  // supuesto: Figma no dibuja la edición de datos ni la descarga
  const pronto = (que: string) => () => mostrar(`${que} estará disponible pronto`);

  const desactivarOEliminar = () => {
    if (cuenta?.eliminacionEl) {
      router.push("/cuenta/eliminar/programada");
    } else {
      router.push("/cuenta/eliminar");
    }
  };

  const cancelar = async () => {
    setCancelando(true);
    try {
      await cancelarEliminacion();
      mostrar("Cancelaste la eliminación de tu cuenta");
      pedirCuenta();
    } catch {
      mostrar("No se pudo cancelar la eliminación. Revisa tu conexión.");
    } finally {
      setCancelando(false);
    }
  };

  if (cuenta === undefined) {
    return (
      <PantallaCuenta titulo="Mi cuenta">
        <ActivityIndicator color={colors.ink} style={styles.cargando} />
      </PantallaCuenta>
    );
  }

  if (cuenta === null) {
    return (
      <PantallaCuenta titulo="Mi cuenta">
        <View style={styles.error}>
          <Text style={[typography.caption, styles.muted, styles.flex]}>
            No pudimos cargar tu cuenta. Revisa tu conexión.
          </Text>
          <Button label="Reintentar" variant="tertiary" onPress={reintentar} />
        </View>
      </PantallaCuenta>
    );
  }

  const rango = calcularRango(cuenta.puntos).actual;

  return (
    <PantallaCuenta titulo="Mi cuenta">
      <View style={styles.perfil}>
        <View style={styles.avatar}>
          <UserRound color={colors.ink} size={sizes.avatarIcono} />
        </View>
        <View style={styles.flex}>
          <Text style={[typography.h2, styles.ink]}>{cuenta.nombre}</Text>
          <Text style={[typography.caption, styles.muted]}>
            {rango.nombre} · {formatearPuntos(cuenta.puntos)} pts
          </Text>
        </View>
      </View>

      {cuenta.eliminacionEl && (
        // supuesto: sin frame. Mientras no haya login, aquí se cancela la
        // eliminación pendiente (texto de D5: «inicia sesión… y toca
        // Cancelar eliminación»). Mismo estilo que el aviso de D2.
        <View style={styles.aviso}>
          <View style={styles.avisoTexto}>
            <Clock color={colors.ink} size={sizes.chevron} />
            <Text style={[typography.bodyStrong, styles.ink, styles.flex]}>
              Tu cuenta se eliminará el {formatearFechaLarga(cuenta.eliminacionEl)}.
            </Text>
          </View>
          <Button
            label={cancelando ? "Cancelando…" : "Cancelar eliminación"}
            variant="secondary"
            fullWidth
            disabled={cancelando}
            onPress={cancelar}
          />
        </View>
      )}

      <Text style={[typography.overline, styles.muted]} accessibilityRole="header">
        Datos de la cuenta
      </Text>
      <TarjetaCuenta estilo={styles.lista}>
        <Fila etiqueta="Nombre" valor={cuenta.nombre} onPress={pronto("Editar tu nombre")} />
        <Fila etiqueta="Celular" valor={cuenta.telefono} onPress={pronto("Cambiar tu celular")} />
        <Fila etiqueta="Correo" valor={cuenta.correo} onPress={pronto("Cambiar tu correo")} />
      </TarjetaCuenta>

      <Text style={[typography.overline, styles.muted]} accessibilityRole="header">
        Privacidad
      </Text>
      <TarjetaCuenta estilo={styles.lista}>
        <Fila Icono={Download} valor="Descargar mis datos" onPress={pronto("Descargar tus datos")} />
        <Fila Icono={Trash} valor="Desactivar o eliminar mi cuenta" onPress={desactivarOEliminar} />
      </TarjetaCuenta>
    </PantallaCuenta>
  );
}

// Fila de la tarjeta: ícono o etiqueta, valor en BodyStrong y ›
function Fila({
  Icono,
  etiqueta,
  valor,
  onPress,
}: {
  Icono?: LucideIcon;
  etiqueta?: string;
  valor: string;
  onPress: () => void;
}) {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta ? `${etiqueta}: ${valor}` : valor}
      style={({ pressed }) => [styles.fila, pressed && styles.pressed]}
    >
      {Icono && <Icono color={colors.ink} size={sizes.iconGlyph} />}
      <View style={[styles.flex, styles.filaTexto]}>
        {etiqueta && <Text style={[typography.caption, styles.muted]}>{etiqueta}</Text>}
        <Text style={[typography.bodyStrong, styles.ink]}>{valor}</Text>
      </View>
      <ChevronRight color={colors.ink} size={sizes.chevron} />
    </Pressable>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    perfil: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical: spacing.xs,
    },
    avatar: {
      width: sizes.avatarMedium,
      height: sizes.avatarMedium,
      borderRadius: radii.pill,
      backgroundColor: colors.yellowSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    aviso: {
      gap: spacing.md,
      paddingHorizontal: sizes.cardPadding,
      paddingVertical: spacing.md,
      borderRadius: radii.badge,
      backgroundColor: colors.yellowSoft,
    },
    avisoTexto: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm + spacing.xxs,
    },
    lista: {
      gap: 0,
      paddingVertical: spacing.xs,
    },
    fila: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      minHeight: sizes.minTouchRow,
      paddingVertical: spacing.md,
    },
    filaTexto: {
      gap: spacing.xxs,
    },
    error: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    cargando: {
      alignSelf: "flex-start",
      marginVertical: spacing.sm,
    },
    flex: {
      flex: 1,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
    pressed: {
      opacity: opacity.pressed,
    },
  });
