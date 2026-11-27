import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { Button, CampoCuenta, PantallaCuenta, useToast } from "@/components";
import { useEstilos, useTema } from "@/context/TemaContext";
import { enviarCodigo, mensajeErrorEnvio } from "@/data/sesion";
import type { Tema } from "@/theme";

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Inicio de sesión, paso 1: correo. supuesto: Figma no tiene pantallas de
// login; se arma con la estructura de D4 (decisión 50).
export default function Ingresar() {
  const router = useRouter();
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const { mostrar } = useToast();

  const [correo, setCorreo] = useState("");
  const [intentado, setIntentado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const limpio = correo.trim().toLowerCase();
  const valido = CORREO_VALIDO.test(limpio);

  const enviar = async () => {
    setIntentado(true);
    if (!valido) return;
    setEnviando(true);
    try {
      await enviarCodigo(limpio);
      router.push({ pathname: "/ingresar/codigo", params: { correo: limpio } });
    } catch (error) {
      mostrar(mensajeErrorEnvio(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <PantallaCuenta
      titulo="Ingresar"
      pregunta="¿Cuál es tu correo?"
      sinAtras
      acciones={
        <Button
          label={enviando ? "Enviando…" : "Enviar código"}
          fullWidth
          disabled={enviando || limpio.length === 0}
          onPress={enviar}
        />
      }
    >
      <Text style={[typography.body, styles.muted]}>
        Te enviaremos un código de 6 dígitos. No necesitas contraseña.
      </Text>
      <CampoCuenta
        etiqueta="Correo"
        value={correo}
        onChangeText={setCorreo}
        placeholder="nombre@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={enviar}
        editable={!enviando}
        validacion={
          intentado && !valido ? { ok: false, texto: "Revisa el correo: falta algo como nombre@correo.com" } : null
        }
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
