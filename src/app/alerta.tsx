import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useNavigation, usePreventRemove, useRouter } from "expo-router";
import { ChevronDown, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Chip, Header, IconButton, ListItem, Toggle, useToast } from "@/components";
import { eliminarAlerta, getAlerta, getOpcionesRutaAlerta, guardarAlerta } from "@/data/repositorio";
import { borderWidths, colors, minTouch, opacity, radii, sizes, spacing, typography } from "@/theme";
import type { AlertaDiaria, MinutosAntes, OpcionRutaAlerta } from "@/types";
import { formatoDias, formatoHora } from "@/utils/formato";

// Valores de Date.getDay(), en el orden de la semana (lunes primero)
const DIAS: { valor: number; inicial: string; nombre: string }[] = [
  { valor: 1, inicial: "L", nombre: "Lunes" },
  { valor: 2, inicial: "M", nombre: "Martes" },
  { valor: 3, inicial: "M", nombre: "Miércoles" },
  { valor: 4, inicial: "J", nombre: "Jueves" },
  { valor: 5, inicial: "V", nombre: "Viernes" },
  { valor: 6, inicial: "S", nombre: "Sábado" },
  { valor: 0, inicial: "D", nombre: "Domingo" },
];

const MINUTOS_ANTES: MinutosAntes[] = [3, 5, 10];
const INTERVALO_MINUTOS = 5;

// Extiende el área táctil de los círculos de día hasta 44 pt
const slopDia = (minTouch - sizes.dayCircle) / 2;
const hitSlopDia = { top: slopDia, bottom: slopDia, left: slopDia, right: slopDia };

type Formulario = {
  hora: number;
  minuto: number;
  dias: number[];
  // Clave de la OpcionRutaAlerta elegida; null si no hay ninguna
  ruta: string | null;
  minutosAntes: MinutosAntes;
  transito: boolean;
  seguridad: boolean;
};

// Alerta nueva: 7:00 AM, de lunes a viernes, avisar a 5 min
const NUEVA: Omit<Formulario, "ruta"> = {
  hora: 7,
  minuto: 0,
  dias: [1, 2, 3, 4, 5],
  minutosAntes: 5,
  transito: true,
  seguridad: true,
};

type Carga =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "no_encontrada" }
  | { tipo: "ok"; opciones: OpcionRutaAlerta[]; alerta: AlertaDiaria | null; inicial: Formulario };

const claveRuta = (opcion: OpcionRutaAlerta) => `${opcion.linea.id}|${opcion.paradero.id}|${opcion.destino.id}`;
const claveAlerta = (alerta: AlertaDiaria) => `${alerta.lineaId}|${alerta.paraderoId}|${alerta.destinoId}`;

const mismosDias = (a: number[], b: number[]) => a.length === b.length && a.every((dia) => b.includes(dia));

const iguales = (a: Formulario, b: Formulario) =>
  a.hora === b.hora &&
  a.minuto === b.minuto &&
  mismosDias(a.dias, b.dias) &&
  a.ruta === b.ruta &&
  a.minutosAntes === b.minutosAntes &&
  a.transito === b.transito &&
  a.seguridad === b.seguridad;

// Hoy a la hora indicada, para el selector de hora
function fechaConHora(hora: number, minuto: number) {
  const fecha = new Date();
  fecha.setHours(hora, minuto, 0, 0);
  return fecha;
}

// F3_03 · Configurar alerta diaria. Con `paraderoId` crea una alerta que sube
// en ese paradero; con `id` edita una existente.
export default function Alerta() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id, paraderoId } = useLocalSearchParams<{ id?: string; paraderoId?: string }>();
  const { mostrar } = useToast();

  const [carga, setCarga] = useState<Carga>({ tipo: "cargando" });
  const [form, setForm] = useState<Formulario | null>(null);
  const [listaAbierta, setListaAbierta] = useState(false);
  const [guardando, setGuardando] = useState(false);
  // Ya se guardó o eliminó: se cierra sin pedir confirmación
  const [cerrando, setCerrando] = useState(false);

  const cargar = useCallback(() => {
    let activo = true;
    (async () => {
      try {
        const alerta = id ? await getAlerta(id) : null;
        if (id && !alerta) {
          if (activo) {
            setCarga({ tipo: "no_encontrada" });
          }
          return;
        }
        // En edición, las rutas del paradero de la alerta: sigue siendo "del paradero"
        const opciones = await getOpcionesRutaAlerta(alerta?.paraderoId ?? paraderoId);
        if (!activo) {
          return;
        }
        const ruta = alerta ? claveAlerta(alerta) : opciones[0] && claveRuta(opciones[0]);
        const base = alerta
          ? {
              hora: alerta.hora,
              minuto: alerta.minuto,
              dias: alerta.dias,
              minutosAntes: alerta.minutosAntes,
              transito: alerta.transito,
              seguridad: alerta.seguridad,
            }
          : NUEVA;
        const inicial: Formulario = {
          ...base,
          // Si la ruta guardada ya no está entre las opciones, hay que elegir otra
          ruta: ruta && opciones.some((opcion) => claveRuta(opcion) === ruta) ? ruta : null,
        };
        setCarga({ tipo: "ok", opciones, alerta, inicial });
        setForm(inicial);
      } catch {
        if (activo) {
          setCarga({ tipo: "error" });
        }
      }
    })();
    return () => {
      activo = false;
    };
  }, [id, paraderoId]);

  useEffect(cargar, [cargar]);

  const hayCambios = carga.tipo === "ok" && form !== null && !iguales(form, carga.inicial);

  // ✕, gesto de bajar el modal o atrás de Android con cambios sin guardar
  usePreventRemove(hayCambios && !cerrando, ({ data }) => {
    Alert.alert("¿Descartar cambios?", "Lo que cambiaste en la alerta no se guardará.", [
      { text: "Seguir editando", style: "cancel" },
      { text: "Descartar", style: "destructive", onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  // Se cierra después de que `cerrando` desactiva la confirmación
  useEffect(() => {
    if (cerrando) {
      router.back();
    }
  }, [cerrando, router]);

  const titulo = id ? "Editar alerta" : "Nueva alerta diaria";
  const header = (
    <Header
      large
      title={titulo}
      leading={<IconButton icon={<X />} accessibilityLabel="Cerrar" onPress={() => router.back()} />}
    />
  );

  if (carga.tipo !== "ok" || !form) {
    return (
      <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
        {header}
        <View style={styles.estado}>
          {carga.tipo === "cargando" && (
            <>
              <ActivityIndicator color={colors.ink} />
              <Text style={[typography.body, styles.muted, styles.centrado]}>Cargando alerta…</Text>
            </>
          )}
          {carga.tipo === "error" && (
            <>
              <Text style={[typography.body, styles.muted, styles.centrado]}>
                No pudimos cargar la alerta. Revisa tu conexión e inténtalo otra vez.
              </Text>
              <Button
                label="Reintentar"
                variant="secondary"
                onPress={() => {
                  setCarga({ tipo: "cargando" });
                  cargar();
                }}
              />
            </>
          )}
          {carga.tipo === "no_encontrada" && (
            <>
              <Text style={[typography.title, styles.ink, styles.centrado]}>No encontramos esta alerta</Text>
              <Text style={[typography.body, styles.muted, styles.centrado]}>Puede que ya la hayas eliminado.</Text>
              <Button label="Volver" variant="secondary" onPress={() => router.back()} />
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const { opciones, alerta } = carga;
  const opcion = opciones.find((o) => claveRuta(o) === form.ruta);
  const cambiar = (cambios: Partial<Formulario>) => setForm((actual) => actual && { ...actual, ...cambios });

  const alternarDia = (dia: number) =>
    cambiar({ dias: form.dias.includes(dia) ? form.dias.filter((d) => d !== dia) : [...form.dias, dia] });

  const cambiarHora = (fecha: Date) => cambiar({ hora: fecha.getHours(), minuto: fecha.getMinutes() });

  // En Android el selector no va dentro de la pantalla: se abre como diálogo
  const abrirHoraAndroid = () =>
    DateTimePickerAndroid.open({
      value: fechaConHora(form.hora, form.minuto),
      mode: "time",
      display: "spinner",
      minuteInterval: INTERVALO_MINUTOS,
      onValueChange: (_, fecha) => cambiarHora(fecha),
    });

  let falta: string | null = null;
  if (!opcion) {
    falta = "Elige una ruta favorita para guardar la alerta";
  } else if (form.dias.length === 0) {
    falta = "Elige al menos un día";
  }

  const guardar = async () => {
    if (!opcion || falta || guardando) {
      return;
    }
    setGuardando(true);
    try {
      await guardarAlerta({
        id: alerta?.id,
        lineaId: opcion.linea.id,
        paraderoId: opcion.paradero.id,
        destinoId: opcion.destino.id,
        hora: form.hora,
        minuto: form.minuto,
        dias: [...form.dias].sort((a, b) => a - b),
        minutosAntes: form.minutosAntes,
        transito: form.transito,
        seguridad: form.seguridad,
        activa: alerta?.activa ?? true,
      });
      mostrar(`Alerta guardada · ${formatoDias(form.dias)} ${formatoHora(form.hora, form.minuto)}`);
      setCerrando(true);
    } catch {
      Alert.alert("No se pudo guardar", "Revisa tu conexión e inténtalo otra vez.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Reintentar", onPress: guardar },
      ]);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = () => {
    if (!alerta) {
      return;
    }
    Alert.alert("¿Eliminar alerta?", "Ya no te avisaremos de esta ruta.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await eliminarAlerta(alerta.id);
            mostrar("Alerta eliminada");
            setCerrando(true);
          } catch {
            Alert.alert("No se pudo eliminar", "Revisa tu conexión e inténtalo otra vez.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      {header}
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={[typography.overline, styles.muted]}>Hora de salida</Text>
        {Platform.OS === "ios" ? (
          <View style={styles.hora}>
            <DateTimePicker
              value={fechaConHora(form.hora, form.minuto)}
              mode="time"
              display="spinner"
              minuteInterval={INTERVALO_MINUTOS}
              themeVariant="light"
              textColor={colors.ink}
              onValueChange={(_, fecha) => cambiarHora(fecha)}
            />
          </View>
        ) : (
          <Pressable
            onPress={abrirHoraAndroid}
            accessibilityRole="button"
            accessibilityLabel={`Hora de salida, ${formatoHora(form.hora, form.minuto)}`}
            accessibilityHint="Cambia la hora"
            style={({ pressed }) => [styles.hora, styles.horaFila, pressed && styles.pressed]}
          >
            <Text style={[typography.display, styles.ink]}>
              {form.hora % 12 || 12} : {String(form.minuto).padStart(2, "0")}
            </Text>
            <Text style={[typography.h2, styles.ink]}>{form.hora < 12 ? "AM" : "PM"}</Text>
          </Pressable>
        )}

        <Text style={[typography.overline, styles.muted]}>Días</Text>
        <View style={styles.dias}>
          {DIAS.map(({ valor, inicial, nombre }) => {
            const elegido = form.dias.includes(valor);
            return (
              <Pressable
                key={valor}
                onPress={() => alternarDia(valor)}
                hitSlop={hitSlopDia}
                accessibilityRole="button"
                accessibilityLabel={nombre}
                accessibilityState={{ selected: elegido }}
                style={({ pressed }) => [styles.dia, elegido && styles.diaElegido, pressed && styles.pressed]}
              >
                <Text style={[typography.captionStrong, elegido ? styles.blanco : styles.ink]}>{inicial}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[typography.overline, styles.muted]}>Ruta favorita</Text>
        {opciones.length === 0 ? (
          <Text style={[typography.body, styles.muted]}>
            Marca una línea o un paradero como favorito para crear una alerta.
          </Text>
        ) : (
          <Pressable
            onPress={() => setListaAbierta((abierta) => !abierta)}
            accessibilityRole="button"
            accessibilityState={{ expanded: listaAbierta }}
            accessibilityHint="Elige la ruta de la alerta"
            style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
          >
            <Text style={[typography.body, styles.ink, styles.selectorTexto]}>
              {opcion ? (
                <>
                  <Text style={typography.bodyStrong}>{opcion.linea.nombre}</Text>
                  {` · ${opcion.paradero.nombre} → ${opcion.destino.nombre}`}
                </>
              ) : (
                "Elegir ruta"
              )}
            </Text>
            <ChevronDown color={colors.ink} size={sizes.iconGlyph} />
          </Pressable>
        )}
        {listaAbierta && (
          <View style={styles.lista}>
            {opciones.map((o) => (
              <ListItem
                key={claveRuta(o)}
                badge={o.linea.codigo}
                title={`${o.linea.nombre} → ${o.destino.nombre}`}
                subtitle={`Sube en ${o.paradero.nombre}`}
                destacado={claveRuta(o) === form.ruta}
                onPress={() => {
                  cambiar({ ruta: claveRuta(o) });
                  setListaAbierta(false);
                }}
              />
            ))}
          </View>
        )}

        <Text style={[typography.overline, styles.muted]}>Avísame cuando mi carro esté a</Text>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {MINUTOS_ANTES.map((minutos) => (
            <Chip
              key={minutos}
              label={`${minutos} min`}
              state={form.minutosAntes === minutos ? "selected" : "default"}
              onPress={() => cambiar({ minutosAntes: minutos })}
            />
          ))}
        </View>

        <View style={styles.ajuste}>
          <Text style={[typography.bodyStrong, styles.ink, styles.ajusteTexto]}>Tránsito y desvíos en mi ruta</Text>
          <Toggle
            value={form.transito}
            onValueChange={(transito) => cambiar({ transito })}
            accessibilityLabel="Tránsito y desvíos en mi ruta"
          />
        </View>
        <View style={styles.ajuste}>
          <Text style={[typography.bodyStrong, styles.ink, styles.ajusteTexto]}>Alertas de seguridad del paradero</Text>
          <Toggle
            value={form.seguridad}
            onValueChange={(seguridad) => cambiar({ seguridad })}
            accessibilityLabel="Alertas de seguridad del paradero"
          />
        </View>
      </ScrollView>

      <View style={styles.pie}>
        {falta && <Text style={[typography.caption, styles.muted, styles.centrado]}>{falta}</Text>}
        <Button
          label={guardando ? "Guardando…" : "Guardar alerta"}
          onPress={guardar}
          disabled={!!falta || guardando}
          fullWidth
        />
        {alerta && <Button label="Eliminar alerta" variant="danger" onPress={confirmarEliminar} fullWidth />}
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
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  hora: {
    alignItems: "center",
    paddingHorizontal: sizes.cardPadding,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  horaFila: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.lg,
  },
  dias: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dia: {
    width: sizes.dayCircle,
    height: sizes.dayCircle,
    borderRadius: radii.pill,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  diaElegido: {
    backgroundColor: colors.ink,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  selectorTexto: {
    flex: 1,
  },
  lista: {
    borderRadius: radii.lg,
    borderWidth: borderWidths.regular,
    borderColor: colors.ink,
    overflow: "hidden",
  },
  chips: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  ajuste: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  ajusteTexto: {
    flex: 1,
  },
  pie: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  estado: {
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  centrado: {
    textAlign: "center",
  },
  ink: {
    color: colors.ink,
  },
  blanco: {
    color: colors.surface,
  },
  muted: {
    color: colors.inkMuted,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
