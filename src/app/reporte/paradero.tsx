import { Smile, Users, UsersRound, type LucideIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Chip, Header, ListItem, Mapa, OpcionGrande, Tile } from "@/components";
import { useReporte } from "@/context/ReporteContext";
import { getLineasPorParadero, getParaderoCercano, getParaderosCercanos, getUbicacionUsuario } from "@/data/repositorio";
import { useEnviarReporte } from "@/hooks/useEnviarReporte";
import { borderWidths, colors, radii, sizes, spacing, typography } from "@/theme";
import type { Coordenada, Linea, Ocupacion, Paradero, TiempoEspera } from "@/types";
import { etiquetaEspera, formatearDistancia } from "@/utils/formato";
import { distanciaMetros } from "@/utils/geo";

const ESPERAS: TiempoEspera[] = ["5_10", "15_20", "mas_30"];

// El estado del paradero se guarda como ocupación. Íconos provisionales: en
// Figma son círculos
const ESTADOS: { valor: Ocupacion; label: string; icono: LucideIcon }[] = [
  { valor: "sentados", label: "Tranquilo", icono: Smile },
  { valor: "lleno", label: "Lleno", icono: Users },
  { valor: "sopa", label: "Desbordado", icono: UsersRound },
];

type Lista = "paraderos" | "lineas";

// F2_05 · Espera en paradero
export default function ReporteParadero() {
  const { borrador, actualizar } = useReporte();
  const { enviar, enviando } = useEnviarReporte();

  const [ubicacion, setUbicacion] = useState<Coordenada>();
  const [cercano, setCercano] = useState<Paradero | null>();
  const [paraderos, setParaderos] = useState<Paradero[]>([]);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [lista, setLista] = useState<Lista | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      const coordenada = await getUbicacionUsuario();
      const [detectado, cercanos] = await Promise.all([
        getParaderoCercano(coordenada.lat, coordenada.lng),
        getParaderosCercanos(coordenada.lat, coordenada.lng),
      ]);
      if (!activo) {
        return;
      }
      setUbicacion(coordenada);
      setCercano(detectado);
      // El detectado siempre se puede volver a elegir, aunque quede fuera del radio
      setParaderos(detectado && !cercanos.some((p) => p.id === detectado.id) ? [detectado, ...cercanos] : cercanos);
    })();
    return () => {
      activo = false;
    };
  }, []);

  // Si no eligió otro, el detectado
  const paraderoId = borrador.paraderoId ?? cercano?.id;
  const paradero = paraderos.find((p) => p.id === paraderoId) ?? cercano;

  useEffect(() => {
    if (!paraderoId) {
      return;
    }
    let activo = true;
    getLineasPorParadero(paraderoId).then((data) => activo && setLineas(data));
    return () => {
      activo = false;
    };
  }, [paraderoId]);

  const linea = lineas.find((l) => l.id === borrador.lineaId);

  const alternarLista = (cual: Lista) => setLista((actual) => (actual === cual ? null : cual));

  // Otro paradero puede no tener la línea elegida: se vuelve a elegir
  const elegirParadero = (id: string) => {
    if (id !== paraderoId) {
      actualizar({ paraderoId: id, lineaId: undefined });
    }
    setLista(null);
  };

  const elegirLinea = (id?: string) => {
    actualizar({ lineaId: id });
    setLista(null);
  };

  const titulo = paradero?.nombre ?? (cercano === null ? "Sin paraderos cerca" : "Buscando paradero…");

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <Header
        eyebrow="Reporte de paradero"
        title={titulo}
        right={paraderos.length > 0 && <Chip label="Cambiar" onPress={() => alternarLista("paraderos")} />}
      />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        {lista === "paraderos" && (
          <View style={styles.lista}>
            {paraderos.map((p) => (
              <ListItem
                key={p.id}
                title={p.nombre}
                subtitle={
                  ubicacion
                    ? `${p.direccion} · ${formatearDistancia(distanciaMetros(ubicacion.lat, ubicacion.lng, p.lat, p.lng))}`
                    : p.direccion
                }
                destacado={p.id === paraderoId}
                onPress={() => elegirParadero(p.id)}
              />
            ))}
          </View>
        )}

        <Mapa
          estilo={styles.mapa}
          paraderos={paradero ? [paradero] : []}
          etiqueta="Mini-mapa del paradero detectado"
        />

        <Text style={[typography.bodyStrong, styles.ink]}>¿Cuánto llevas esperando?</Text>
        <View style={styles.opciones} accessibilityRole="radiogroup">
          {ESPERAS.map((espera) => (
            <OpcionGrande
              key={espera}
              label={etiquetaEspera(espera)}
              selected={borrador.espera === espera}
              onPress={() => actualizar({ espera })}
            />
          ))}
        </View>

        <Text style={[typography.bodyStrong, styles.ink]}>¿Cómo está el paradero?</Text>
        <View style={styles.fila} accessibilityRole="radiogroup">
          {ESTADOS.map(({ valor, label, icono: Icono }) => (
            <Tile
              key={valor}
              label={label}
              icon={<Icono />}
              state={borrador.ocupacion === valor ? "selected" : "default"}
              // Tocar el elegido lo quita
              onPress={() => actualizar({ ocupacion: borrador.ocupacion === valor ? undefined : valor })}
              fill
            />
          ))}
        </View>

        <View style={styles.linea}>
          <Text style={[typography.caption, styles.muted]}>¿Esperas una línea?</Text>
          <Chip
            label={`${linea?.nombre ?? "Elegir"} ▾`}
            state={lista === "lineas" ? "selected" : "default"}
            onPress={() => alternarLista("lineas")}
          />
        </View>

        {lista === "lineas" && (
          <View style={styles.lista}>
            {lineas.map((l) => (
              <ListItem
                key={l.id}
                badge={l.codigo}
                title={l.nombre}
                subtitle={l.tramo}
                destacado={l.id === borrador.lineaId}
                onPress={() => elegirLinea(l.id)}
              />
            ))}
            <ListItem title="Ninguna en especial" destacado={!borrador.lineaId} onPress={() => elegirLinea(undefined)} />
          </View>
        )}
      </ScrollView>

      <View style={styles.abajo}>
        <Button
          label={enviando ? "Enviando…" : "Enviar al toque"}
          onPress={() => enviar({ ...borrador, paraderoId })}
          disabled={!borrador.espera || !paraderoId || enviando}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  contenido: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  lista: {
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    overflow: "hidden",
  },
  mapa: {
    height: sizes.paraderoMap,
    borderRadius: radii.lg,
    borderWidth: borderWidths.thin,
    borderColor: colors.line,
  },
  opciones: {
    gap: spacing.md,
  },
  fila: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  linea: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  abajo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  ink: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
});
