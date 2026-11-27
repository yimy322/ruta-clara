import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { Button, CampoCuenta, PantallaCuenta, useToast } from "@/components";
import { PALABRA_ELIMINAR } from "@/config/cuenta";
import { useEstilos, useTema } from "@/context/TemaContext";
import { solicitarEliminacion } from "@/data/repositorio";
import type { Tema } from "@/theme";

// D4 · Eliminar cuenta, paso 3 de 3: escribir ELIMINAR para confirmar.
// Orden de foco: campo → Eliminar mi cuenta → Cancelar (orden del árbol).
export default function EliminarConfirmar() {
  const router = useRouter();
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const { mostrar } = useToast();

  const [texto, setTexto] = useState("");
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

      <CampoCuenta
        etiqueta={`Escribe ${PALABRA_ELIMINAR}`}
        accessibilityLabel={`Escribe ${PALABRA_ELIMINAR} para confirmar`}
        value={texto}
        onChangeText={setTexto}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        returnKeyType="done"
        editable={!enviando}
        validacion={escrito ? { ok: coincide, texto: coincide ? "La palabra coincide" : "La palabra no coincide" } : null}
      />
    </PantallaCuenta>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    muted: {
      color: colors.inkMuted,
    },
  });
