import { useFocusEffect, useRouter } from "expo-router";
import { Eye, Lock, Settings, ShieldCheck, Sunrise, User, type LucideIcon } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BarraProgreso, Button, Chip, IconButton, ListItem, TarjetaEstadistica, Tile } from "@/components";
import { RANGOS } from "@/config/gamificacion";
import { usePreferencias } from "@/context/PreferenciasContext";
import { getHistorialReportes, getInsignias, getUsuario } from "@/data/repositorio";
import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
import type { Insignia, ReporteHistorial, Usuario } from "@/types";
import { formatearDia, formatearPuntos, tituloHistorial } from "@/utils/formato";
import { calcularRango, progresoEscala } from "@/utils/gamificacion";

// Íconos provisionales: en Figma son círculos
const ICONOS: Record<string, LucideIcon> = {
  madrugador: Sunrise,
  "ojo-de-halcon": Eye,
  "vecino-seguro": ShieldCheck,
};

type Datos = {
  usuario: Usuario;
  historial: ReporteHistorial[];
  insignias: Insignia[];
};

// F2_09 · Historial y logros
export default function Perfil() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reiniciarOnboarding } = usePreferencias();
  const [datos, setDatos] = useState<Datos>();

  // Al volver a la tab, por si ganó puntos reportando
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      Promise.all([getUsuario(), getHistorialReportes(), getInsignias()]).then(([usuario, historial, insignias]) => {
        if (activo) {
          setDatos({ usuario, historial, insignias });
        }
      });
      return () => {
        activo = false;
      };
    }, []),
  );

  const verInsignia = (insignia: Insignia) =>
    Alert.alert(insignia.nombre, insignia.obtenida ? `Lograda: ${insignia.requisito}` : insignia.requisito);

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <View style={[styles.barra, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={[typography.h1, styles.ink]} accessibilityRole="header">
          Mi perfil
        </Text>
        {/* TODO F3_05: ajustes */}
        <IconButton icon={<Settings />} accessibilityLabel="Ajustes" onPress={() => router.push("/ajustes")} />
      </View>

      {!datos ? (
        <ActivityIndicator style={styles.cargando} color={colors.ink} />
      ) : (
        <ScrollView contentContainerStyle={styles.contenido}>
          <Encabezado usuario={datos.usuario} />

          <View style={styles.escala}>
            <View style={styles.rangos}>
              {RANGOS.map((rango) => (
                <Text key={rango.nombre} style={[typography.caption, styles.muted]} numberOfLines={1}>
                  {rango.nombreCorto}
                </Text>
              ))}
            </View>
            <BarraProgreso progreso={progresoEscala(datos.usuario.puntos)} />
          </View>

          <View style={styles.fila}>
            <TarjetaEstadistica valor={String(datos.usuario.reportesMes)} label="reportes del mes" />
            <TarjetaEstadistica valor={formatearPuntos(datos.usuario.puntos)} label="puntos" />
            <TarjetaEstadistica valor={`${datos.usuario.porcentajeConfirmados}%`} label="confirmados" />
          </View>

          <Text style={[typography.overline, styles.muted]}>Insignias</Text>
          <View style={styles.fila}>
            {datos.insignias.map((insignia) => {
              const Icono = insignia.obtenida ? (ICONOS[insignia.id] ?? ShieldCheck) : Lock;
              return (
                <Tile
                  key={insignia.id}
                  label={insignia.obtenida ? insignia.nombre : "Bloqueada"}
                  icon={<Icono />}
                  atenuado={!insignia.obtenida}
                  onPress={() => verInsignia(insignia)}
                  fill
                />
              );
            })}
          </View>

          <Text style={[typography.overline, styles.muted]}>Historial</Text>
          {datos.historial.length === 0 ? (
            <Text style={[typography.body, styles.muted]}>Aún no tienes reportes</Text>
          ) : (
            <View style={styles.historial}>
              {datos.historial.map((item) => (
                <ListItem
                  key={item.reporte.id}
                  title={tituloHistorial(item)}
                  subtitle={`${formatearDia(item.reporte.creadoEn)} · +${item.puntos} pts`}
                  trailing={item.vencido ? "Vencido" : `✓ ${item.reporte.confirmaciones} confirman`}
                />
              ))}
            </View>
          )}

          {__DEV__ && (
            <View style={styles.dev}>
              <Text style={[typography.overline, styles.muted]}>Desarrollo</Text>
              <Button label="Ver catálogo" variant="tertiary" onPress={() => router.push("/dev/catalogo")} />
              <Button label="Ver datos" variant="tertiary" onPress={() => router.push("/dev/datos")} />
              {/* Vuelve al primer uso: Stack.Protected redirige a /onboarding */}
              <Button label="Reiniciar onboarding" variant="tertiary" onPress={reiniciarOnboarding} />
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Avatar, nombre y rango actual
function Encabezado({ usuario }: { usuario: Usuario }) {
  const { actual } = calcularRango(usuario.puntos);

  return (
    <View style={styles.encabezado}>
      {/* Placeholder: todavía no hay foto de perfil */}
      <View style={styles.avatar}>
        <User color={colors.inkMuted} size={sizes.tileIcon} />
      </View>
      <View style={styles.nombre}>
        <Text style={[typography.h2, styles.ink]} numberOfLines={1}>
          {usuario.nombre}
        </Text>
        <Chip label={`★ ${actual.nombre}`} state="live" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  barra: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  cargando: {
    flex: 1,
  },
  contenido: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  avatar: {
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: radii.pill,
    borderWidth: borderWidths.thin,
    borderStyle: "dashed",
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  nombre: {
    flex: 1,
    gap: spacing.sm,
  },
  escala: {
    gap: spacing.sm,
  },
  rangos: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  fila: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  // ListItem trae su propio padding horizontal; aquí va al ras del contenido
  historial: {
    marginHorizontal: -spacing.lg,
  },
  dev: {
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
});
