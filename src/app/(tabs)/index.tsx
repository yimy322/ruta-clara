import { useRouter } from "expo-router";
import { Bell, LocateFixed, Menu, Plus, Search, TriangleAlert } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BannerUbicacion,
  Button,
  CardParadero,
  Chip,
  IconButton,
  Mapa,
  MenuLateral,
  type DatosCardParadero,
} from "@/components";
import {
  getActividadParadero,
  getLugaresGuardados,
  getParaderoCercano,
  getParaderosCercanos,
  getResumenParadero,
  getUbicacionUsuario,
  getUnidadesEnVivo,
} from "@/data/repositorio";
import { useEstilos, useTema } from "@/context/TemaContext";
import { usePermisoUbicacion } from "@/hooks/usePermisoUbicacion";
import { opacity, radii, sizes, spacing, type Tema } from "@/theme";
import type { Coordenada, LugarGuardado, Paradero, UnidadEnVivo } from "@/types";
import { distanciaMetros } from "@/utils/geo";
import { ICONO_LUGAR } from "@/utils/icons";

// F1_04 · Inicio — Principal
export default function Inicio() {
  const { colors, typography } = useTema();
  const styles = useEstilos(crearEstilos);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const permiso = usePermisoUbicacion();

  const [usuario, setUsuario] = useState<Coordenada>();
  const [paraderos, setParaderos] = useState<Paradero[]>([]);
  const [unidades, setUnidades] = useState<UnidadEnVivo[]>([]);
  const [lugares, setLugares] = useState<LugarGuardado[]>([]);
  // undefined = cargando; null = no hay paradero cercano
  const [cercano, setCercano] = useState<DatosCardParadero | null>();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Alto de los controles flotantes, para que el mapa no ponga puntos debajo
  const [altoArriba, setAltoArriba] = useState(0);
  const [altoAbajo, setAltoAbajo] = useState(0);

  useEffect(() => {
    let activo = true;

    getLugaresGuardados().then((data) => activo && setLugares(data));

    (async () => {
      const ubicacion = await getUbicacionUsuario();
      if (!activo) {
        return;
      }
      setUsuario(ubicacion);
      const { lat, lng } = ubicacion;

      getParaderosCercanos(lat, lng).then((data) => activo && setParaderos(data));
      getUnidadesEnVivo(lat, lng).then((data) => activo && setUnidades(data));

      const paradero = await getParaderoCercano(lat, lng);
      if (!paradero) {
        if (activo) {
          setCercano(null);
        }
        return;
      }
      const [actividad, resumen] = await Promise.all([
        getActividadParadero(paradero.id),
        getResumenParadero(paradero.id),
      ]);
      if (activo) {
        setCercano({
          paradero,
          actividad,
          proximas: resumen?.proximas ?? [],
          distanciaM: distanciaMetros(lat, lng, paradero.lat, paradero.lng),
        });
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  const alto = (setter: (valor: number) => void) => (e: LayoutChangeEvent) => setter(e.nativeEvent.layout.height);

  return (
    <View style={styles.screen}>
      <Mapa
        estilo={StyleSheet.absoluteFill}
        usuario={usuario}
        paraderos={paraderos}
        unidades={unidades}
        marcadorParadero="P"
        estiloUnidad="burbuja"
        margen={{ top: altoArriba, bottom: altoAbajo }}
      />

      {/* box-none: el área vacía de la capa deja pasar los toques al mapa (Fase 6) */}
      <SafeAreaView style={styles.capa} edges={["left", "right"]} pointerEvents="box-none">
        <View style={{ paddingTop: insets.top + spacing.sm }} onLayout={alto(setAltoArriba)}>
          <View style={styles.header}>
            <IconButton
              icon={<Menu />}
              accessibilityLabel="Menú"
              onPress={() => setMenuAbierto(true)}
            />
            <Pressable
              onPress={() => router.push("/buscar")}
              accessibilityRole="search"
              accessibilityLabel="¿A dónde vas?"
              style={({ pressed }) => [styles.buscador, pressed && styles.pressed]}
            >
              <Search color={colors.inkMuted} size={sizes.iconGlyph} />
              <Text style={[typography.body, styles.muted]} numberOfLines={1}>
                ¿A dónde vas?
              </Text>
            </Pressable>
            <View>
              <IconButton
                icon={<Bell />}
                accessibilityLabel="Alertas, hay novedades"
                onPress={() => router.navigate("/alertas")}
              />
              <View style={styles.punto} />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.accesos}
          >
            {lugares.map((lugar) => {
              const Icono = ICONO_LUGAR[lugar.nombre];
              return (
                <Chip
                  key={lugar.id}
                  label={lugar.nombre}
                  icon={<Icono />}
                  onPress={() => router.push({ pathname: "/rutas", params: { destino: lugar.nombre } })}
                />
              );
            })}
            <Chip
              label="Seguridad"
              state="alert"
              icon={<TriangleAlert />}
              onPress={() => router.push("/seguridad")}
            />
          </ScrollView>
        </View>

        <View style={styles.abajo} onLayout={alto(setAltoAbajo)}>
          <View style={styles.acciones}>
            <IconButton
              icon={<LocateFixed />}
              accessibilityLabel="Centrar en mi ubicación"
              onPress={() => {
                // TODO Fase 6: centrar el mapa real; el provisional ya encuadra al usuario
              }}
            />
            {/* El View deja que el botón se alinee a la derecha (Button usa alignSelf) */}
            <View>
              <Button label="Reportar" variant="danger" pill icon={<Plus />} onPress={() => router.push("/reporte")} />
            </View>
          </View>
          {!permiso.concedido && (
            <BannerUbicacion
              puedePedir={permiso.puedePedir}
              onPress={permiso.activar}
              onBuscar={() => router.push("/buscar")}
            />
          )}
          {/* Sin permiso, la tarjeta de ubicación ocupa el lugar del paradero cercano (E10) */}
          {permiso.concedido && cercano !== null && (
            <CardParadero
              datos={cercano ?? null}
              onPress={(id) => router.push({ pathname: "/paradero/[id]", params: { id } })}
            />
          )}
        </View>
      </SafeAreaView>

      <MenuLateral visible={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
    </View>
  );
}

const crearEstilos = ({ colors, shadows }: Tema) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.map,
    },
    capa: {
      flex: 1,
      justifyContent: "space-between",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    buscador: {
      flex: 1,
      // Altura mínima: con texto grande (hasta 200 %) el control crece en vez de cortar el texto
      minHeight: sizes.searchHeight,
      flexDirection: "row",
      alignItems: "center",
      gap: sizes.legendPadding,
      paddingHorizontal: spacing.md,
      borderRadius: radii.control,
      backgroundColor: colors.surface,
      ...shadows.card,
    },
    punto: {
      position: "absolute",
      top: -spacing.xs,
      right: -spacing.xs,
      width: sizes.badgeDot,
      height: sizes.badgeDot,
      borderRadius: radii.pill,
      backgroundColor: colors.red,
    },
    accesos: {
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    abajo: {
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    acciones: {
      alignItems: "flex-end",
      gap: spacing.md,
    },
    muted: {
      color: colors.inkMuted,
    },
    pressed: {
      opacity: opacity.pressed,
    },
  });
