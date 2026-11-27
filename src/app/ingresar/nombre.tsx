import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { Button, CampoCuenta, PantallaCuenta, useToast } from "@/components";
import { useSesion } from "@/context/SesionContext";
import { useEstilos, useTema } from "@/context/TemaContext";
import { guardarNombre } from "@/data/sesion";
import { SinConexionError } from "@/data/simulacion";
import type { Tema } from "@/theme";

const LARGO_MAXIMO = 40;

// Inicio de sesión, primera vez: nombre del perfil. supuesto: sin frame en
// Figma (decisión 57). Al guardar, Stack.Protected entra a la app.
export default function IngresarNombre() {
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const { mostrar } = useToast();
  const { sesion, nombreGuardado } = useSesion();

  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);

  const limpio = nombre.trim();

  const continuar = async () => {
    if (!limpio || !sesion) return;
    setGuardando(true);
    try {
      await guardarNombre(sesion.usuarioId, limpio);
      nombreGuardado();
    } catch (error) {
      setGuardando(false);
      mostrar(
        error instanceof SinConexionError
          ? "Sin conexión. Revisa tu internet e inténtalo de nuevo."
          : "No pudimos guardar tu nombre. Inténtalo de nuevo.",
      );
    }
  };

  return (
    <PantallaCuenta
      titulo="Bienvenido"
      pregunta="¿Cómo te llamas?"
      sinAtras
      acciones={
        <Button
          label={guardando ? "Guardando…" : "Continuar"}
          fullWidth
          disabled={!limpio || guardando}
          onPress={continuar}
        />
      }
    >
      <Text style={[typography.body, styles.muted]}>Así te verán en tus reportes y logros.</Text>
      <CampoCuenta
        etiqueta="Nombre"
        value={nombre}
        onChangeText={setNombre}
        placeholder="Por ejemplo, Rosa M."
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        maxLength={LARGO_MAXIMO}
        returnKeyType="done"
        onSubmitEditing={continuar}
        editable={!guardando}
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
