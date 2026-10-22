import { Bell, Bus, MapPin, Search, Share2, ShieldAlert, Star, TrafficCone, Users } from "lucide-react-native";
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
  Tile,
  Toggle,
  type BottomNavTab,
} from "@/components";
import { catalogHeader, catalogRoutes } from "@/mocks/catalog";
import { colors, radii, spacing, typography } from "@/theme";

// Pantalla de desarrollo: catálogo de componentes base con todas sus variantes,
// como la sección "Componentes" de Figma. Se abre desde "Ver catálogo" en Inicio.
const noop = () => {};

export default function Catalogo() {
  const [alertsOn, setAlertsOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);
  const [tab, setTab] = useState<BottomNavTab>("inicio");

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header title="Catálogo de componentes" />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Section title="Button">
          <Variant label="Primary">
            <Button label="Buscar ruta" onPress={noop} fullWidth />
          </Variant>
          <Variant label="Secondary">
            <Button label="Ver en el mapa" variant="secondary" onPress={noop} fullWidth />
          </Variant>
          <Variant label="Tertiary">
            <Button label="Omitir" variant="tertiary" onPress={noop} />
          </Variant>
          <Variant label="Danger">
            <Button label="Reportar peligro" variant="danger" onPress={noop} fullWidth />
          </Variant>
          <Variant label="Disabled">
            <Button label="Enviar reporte" onPress={noop} fullWidth disabled />
          </Variant>
        </Section>

        <Section title="Chip">
          <View style={styles.row}>
            <Chip label="La 50" onPress={noop} />
            <Chip label="Paradero Puente Nuevo" state="selected" />
            <Chip label="En vivo · 4 min" state="live" />
            <Chip label="Seguridad / Peligro" state="alert" />
          </View>
          <Text style={styles.caption}>Default (presionable) · Selected · Live · Alert</Text>
        </Section>

        <Section title="Icon Button">
          <View style={styles.row}>
            <IconButton icon={<Search />} onPress={noop} accessibilityLabel="Buscar" />
            <IconButton icon={<Star />} onPress={noop} accessibilityLabel="Favorito" active />
            <IconButton icon={<Share2 />} onPress={noop} accessibilityLabel="Compartir viaje" />
          </View>
          <Text style={styles.caption}>Default · Active</Text>
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

        <Section title="Bottom Nav">
          <View style={styles.card}>
            <BottomNav active={tab} onSelect={setTab} />
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
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
  return (
    <View style={styles.variant}>
      <Text style={[typography.overline, styles.muted]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: radii.lg,
    overflow: "hidden",
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
