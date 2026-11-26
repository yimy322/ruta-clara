import { useRouter } from "expo-router";
import { Check, X } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { Button, PantallaCuenta, useToast } from "@/components";
import { PALABRA_ELIMINAR } from "@/config/cuenta";
import { useEstilos, useTema } from "@/context/TemaContext";
import { solicitarEliminacion } from "@/data/repositorio";
import { borderWidths, radii, sizes, type Tema } from "@/theme";

// D4 · Eliminar cuenta, paso 3 de 3: escribir ELIMINAR para confirmar.
// Orden de foco: campo → Eliminar mi cuenta → Cancelar (orden del árbol).
export default function EliminarConfirmar() {
  const router = useRouter();
  const { colors, shadows, typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const { mostrar } = useToast();

  const [texto, setTexto] = useState("");
  const [enfocado, setEnfocado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Sin importar mayúsculas ni espacios al borde
  const coincide = texto.trim().toUpperCase() === PALABRA_ELIMINAR;
  const escrito = texto.trim().length > 0;

  const eliminar = async () => {
    setEnviando(true);
    try {
      await solicitarEliminacion();
      // D5 reemplaza a D4: el flujo ya no se puede recorrer hacia atrás
      router.replace("/cuenta/eliminar/programada");
    } catch {
      setEnviando(false);
      mostrar("No se pudo enviar la solicitud. Revisa tu conexión.");
    }
  };

  return (
    <PantallaCuenta
      titulo="Eliminar cuenta"
      paso={3}
      pregunta="Confirma la eliminación"
      acciones={
        <>
          <Button
            label={enviando ? "Eliminando…" : "Eliminar mi cuenta"}
            variant="danger"
            fullWidth
            disabled={!coincide || enviando}
            onPress={eliminar}
          />
          <Button label="Cancelar" variant="tertiary" fullWidth onPress={() => router.dismissTo("/cuenta")} />
        </>
      }
    >
      <Text style={[typography.body, styles.muted]}>
        Para confirmar, escribe {PALABRA_ELIMINAR} en el campo. Así evitamos que tu cuenta se borre por error.
      </Text>

      <View style={styles.campo}>
        <Text style={[typography.captionStrong, styles.ink]} importantForAccessibility="no" accessibilityElementsHidden>
          Escribe {PALABRA_ELIMINAR}
        </Text>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          returnKeyType="done"
          editable={!enviando}
          accessibilityLabel={`Escribe ${PALABRA_ELIMINAR} para confirmar`}
          style={[typography.bodyStrong, styles.ink, styles.entrada, enfocado && shadows.focusRing]}
        />
        {escrito && (
          <View style={styles.validacion} accessibilityLiveRegion="polite">
            {coincide ? (
              <Check color={colors.ink} size={sizes.chipIcon} />
            ) : (
              <X color={colors.redStrong} size={sizes.chipIcon} />
            )}
            <Text style={[typography.caption, coincide ? styles.ink : styles.rojo]}>
              {coincide ? "La palabra coincide" : "La palabra no coincide"}
            </Text>
          </View>
        )}
      </View>
    </PantallaCuenta>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    campo: {
      gap: sizes.chipGap,
      paddingTop: sizes.chipGap,
    },
    entrada: {
      padding: sizes.cardPadding,
      borderWidth: borderWidths.regular,
      borderColor: colors.ink,
      borderRadius: radii.badge,
      backgroundColor: colors.surface,
    },
    validacion: {
      flexDirection: "row",
      alignItems: "center",
      gap: sizes.chipGap,
    },
    ink: {
      color: colors.ink,
    },
    muted: {
      color: colors.inkMuted,
    },
    rojo: {
      color: colors.redStrong,
    },
  });
