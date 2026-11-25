import {
  Bell,
  Bus,
  House,
  MapPin,
  Radio,
  Search,
  Share2,
  ShieldAlert,
  Star,
  TrafficCone,
  TriangleAlert,
  Users,
} from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BottomNav,
  Button,
  Chip,
  Header,
  IconButton,
  ListItem,
  Segmented,
  Tile,
  Toggle,
  useToast,
  type BottomNavTab,
} from "@/components";
import { useEstilos, useTema } from "@/context/TemaContext";
import { catalogHeader, catalogRoutes } from "@/mocks/catalog";
import { radii, sizes, spacing, type ShadowToken, type Tema } from "@/theme";

// Pantalla de desarrollo: catálogo de componentes base con todas sus variantes,
// como la sección "Componentes" de Figma. Se abre desde "Ver catálogo" en Inicio.
const noop = () => {};

const SOMBRAS: ShadowToken[] = ["card", "float", "sheet", "pin", "primary", "danger", "focusRing"];

export default function Catalogo() {
  const { colors, shadows } = useTema();
  const styles = useEstilos(crearEstilos);

  const [alertsOn, setAlertsOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);
  const [tab, setTab] = useState<BottomNavTab>("inicio");
  const [sentido, setSentido] = useState<"ida" | "vuelta">("ida");
  const { mostrar } = useToast();

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header title="Catálogo de componentes" />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Section title="Button">
          <Variant label="Primary · Default / Disabled">
            <Button label="Buscar ruta" onPress={noop} fullWidth />
            <Button label="Buscar ruta" onPress={noop} fullWidth disabled />
          </Variant>
          <Variant label="Secondary · Default / Disabled">
            <Button label="Ver en el mapa" variant="secondary" onPress={noop} fullWidth />
            <Button label="Ver en el mapa" variant="secondary" onPress={noop} fullWidth disabled />
          </Variant>
          <Variant label="Tertiary · Default / Disabled">
            <View style={styles.row}>
              <Button label="Omitir" variant="tertiary" onPress={noop} />
              <Button label="Omitir" variant="tertiary" onPress={noop} disabled />
            </View>
          </Variant>
          <Variant label="Danger · Default / Disabled">
            <Button label="Reportar peligro" variant="danger" onPress={noop} fullWidth />
            <Button label="Reportar peligro" variant="danger" onPress={noop} fullWidth disabled />
          </Variant>
          <Variant label="Con ícono · Pill">
            <Button label="Reportar" variant="danger" icon={<TriangleAlert />} onPress={noop} pill />
          </Variant>
          <Text style={styles.caption}>
            Pressed: mantén presionado cualquier botón. Focus: anillo azul al navegar con teclado o Control por
            botón.
          </Text>
        </Section>

        <Section title="Chip">
          <View style={styles.row}>
            <Chip label="La 50" onPress={noop} />
            <Chip label="Paradero Puente Nuevo" state="selected" />
            <Chip label="En vivo · 4 min" state="live" />
            <Chip label="Seguridad / Peligro" state="alert" />
          </View>
          <View style={styles.row}>
            <Chip label="Casa" icon={<House />} onPress={noop} />
            <Chip label="Todas" icon={<Bell />} state="selected" onPress={noop} />
            <Chip label="En vivo" icon={<Radio />} state="live" />
            <Chip label="Seguridad" icon={<TriangleAlert />} state="alert" onPress={noop} />
          </View>
          <Text style={styles.caption}>Default · Selected · Live · Alert (sin y con ícono)</Text>
        </Section>

        <Section title="Icon Button">
          <View style={styles.row}>
            <IconButton icon={<Search />} onPress={noop} accessibilityLabel="Buscar" />
            <IconButton icon={<Star />} onPress={noop} accessibilityLabel="Favorito" active />
            <IconButton icon={<Star />} onPress={noop} accessibilityLabel="Quitar de favoritos" tono="destacado" />
            <IconButton icon={<Share2 />} onPress={noop} accessibilityLabel="Compartir viaje" />
          </View>
          <Text style={styles.caption}>Default · Active · Destacado · Default</Text>
        </Section>

        <Section title="Toggle">
          <ListItem
            title="Alertas de seguridad"
            subtitle={alertsOn ? "On" : "Off"}
            trailing={
              <Toggle value={alertsOn} onValueChange={setAlertsOn} accessibilityLabel="Alertas de seguridad" />
            }
          />
          <ListItem
            title="Compartir ubicación"
            subtitle={shareOn ? "On" : "Off"}
            trailing={
              <Toggle value={shareOn} onValueChange={setShareOn} accessibilityLabel="Compartir ubicación" />
            }
          />
        </Section>

        <Section title="Tile">
          <View style={styles.row}>
            <Tile label="Lleno" icon={<Users />} onPress={noop} />
            <Tile label="Tráfico" icon={<TrafficCone />} state="selected" onPress={noop} />
            <Tile label="Seguridad / Peligro" icon={<ShieldAlert />} state="danger" onPress={noop} />
            <Tile label="Otro" onPress={noop} />
          </View>
          <Text style={styles.caption}>Default · Selected · Danger · Sin ícono</Text>
        </Section>

        <Section title="List Item">
          <View style={styles.card}>
            {catalogRoutes.map((route) => (
              <ListItem
                key={route.id}
                badge={route.badge}
                title={route.title}
                subtitle={route.subtitle}
                trailing={route.trailing}
                onPress={noop}
              />
            ))}
            <ListItem badge={<Bus />} title="Unidad en camino" subtitle="Badge con ícono" />
            <ListItem badge={<MapPin />} title="Paradero Puente Nuevo" />
            <ListItem title="Solo título y texto final" trailing={<Bell color={colors.inkMuted} />} />
          </View>
        </Section>

        <Section title="Header">
          <View style={styles.card}>
            <Header title="Reportar" onBack={noop} />
          </View>
          <View style={styles.card}>
            <Header
              eyebrow={catalogHeader.eyebrow}
              title={catalogHeader.title}
              subtitle={catalogHeader.subtitle}
              onBack={noop}
              right={<IconButton icon={<Star />} onPress={noop} accessibilityLabel="Agregar a favoritos" />}
            />
          </View>
        </Section>

        <Section title="Segmented">
          <Segmented
            opciones={[
              { valor: "ida", label: "Ida" },
              { valor: "vuelta", label: "Vuelta" },
            ]}
            valor={sentido}
            onChange={setSentido}
          />
        </Section>

        <Section title="Toast">
          <Button label="Mostrar toast" variant="secondary" onPress={() => mostrar("Guardado en Favoritos")} />
        </Section>

        <Section title="Bottom Nav">
          <View style={styles.card}>
            <BottomNav active={tab} onSelect={setTab} badge={{ alertas: 2 }} />
          </View>
        </Section>
        <Section title="Sombras">
          <View style={styles.row}>
            {SOMBRAS.map((sombra) => (
              <View key={sombra} style={[styles.sombra, shadows[sombra]]}>
                <Text style={styles.caption}>{sombra}</Text>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);

  return (
    <View style={styles.section}>
      <Text style={[typography.h2, styles.ink]} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Variant({ label, children }: { label: string; children: ReactNode }) {
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);

  return (
    <View style={styles.variant}>
      <Text style={[typography.overline, styles.muted]}>{label}</Text>
      {children}
    </View>
  );
}

const crearEstilos = ({ colors, typography }: Tema) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.xxl,
    },
    section: {
      gap: spacing.md,
    },
    variant: {
      gap: spacing.xs,
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.control,
      overflow: "hidden",
    },
    sombra: {
      width: sizes.tileWidth,
      height: sizes.buttonHeightLarge,
      borderRadius: radii.control,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    caption: {
      ...typography.caption,
      color: colors.inkMuted,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
  });
