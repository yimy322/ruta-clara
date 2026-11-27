import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, type TextInputInstance } from "react-native";

import { Button, CampoCuenta, PantallaCuenta, useToast } from "@/components";
import { useEstilos, useTema } from "@/context/TemaContext";
import { enviarCodigo, ErrorSesion, mensajeErrorEnvio, verificarCodigo } from "@/data/sesion";
import { SinConexionError } from "@/data/simulacion";
import { sizes, type Tema } from "@/theme";

const LARGO_CODIGO = 6;
// Supabase deja pedir un código nuevo cada 60 s
const ESPERA_REENVIO_S = 60;

// Inicio de sesión, paso 2: código de 6 dígitos. supuesto: sin frame en
// Figma (decisión 50). Al verificar, Stack.Protected cambia de pantalla solo.
export default function IngresarCodigo() {
  const { correo = "" } = useLocalSearchParams<{ correo: string }>();
  const { typography } = useTema();
  const styles = useEstilos(crearEstilos);
  const { mostrar } = useToast();
  const campo = useRef<TextInputInstance>(null);

  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [espera, setEspera] = useState(ESPERA_REENVIO_S);
  const [reenviando, setReenviando] = useState(false);

  // Cuenta regresiva para «Reenviar código»
  useEffect(() => {
    if (espera <= 0) return;
    const id = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [espera]);

  const verificar = async (valor: string) => {
    setVerificando(true);
    setError(null);
    try {
      await verificarCodigo(correo, valor);
    } catch (e) {
      setVerificando(false);
      setCodigo("");
      setError(
        e instanceof SinConexionError
          ? "Sin conexión. Revisa tu internet e inténtalo de nuevo."
          : e instanceof ErrorSesion && e.motivo === "codigo"
            ? "El código no es correcto o ya venció"
            : "No pudimos verificar el código. Inténtalo de nuevo.",
      );
      campo.current?.focus();
    }
  };

  // Solo dígitos; verifica al completar los 6 (también al pegar o autocompletar)
  const cambiar = (texto: string) => {
    const digitos = texto.replace(/\D/g, "").slice(0, LARGO_CODIGO);
    setCodigo(digitos);
    if (error) setError(null);
    if (digitos.length === LARGO_CODIGO && !verificando) {
      void verificar(digitos);
    }
  };

  const reenviar = async () => {
    setReenviando(true);
    try {
      await enviarCodigo(correo);
      setEspera(ESPERA_REENVIO_S);
      setCodigo("");
      setError(null);
      mostrar("Te enviamos un código nuevo");
    } catch (e) {
      mostrar(mensajeErrorEnvio(e));
    } finally {
      setReenviando(false);
    }
  };

  const segundos = `0:${String(espera).padStart(2, "0")}`;

  return (
    <PantallaCuenta
      titulo="Ingresar"
      pregunta="Escribe el código"
      acciones={
        <>
          <Button
            label={verificando ? "Verificando…" : "Verificar"}
            fullWidth
            disabled={verificando || codigo.length < LARGO_CODIGO}
            onPress={() => void verificar(codigo)}
          />
          <Button
            label={reenviando ? "Enviando…" : espera > 0 ? `Reenviar código (${segundos})` : "Reenviar código"}
            variant="tertiary"
            fullWidth
            disabled={espera > 0 || reenviando || verificando}
            onPress={reenviar}
          />
        </>
      }
    >
      <Text style={[typography.body, styles.muted]}>
        Lo enviamos a {correo}. Vence en 10 minutos.
      </Text>
      <CampoCuenta
        ref={campo}
        etiqueta="Código de 6 dígitos"
        value={codigo}
        onChangeText={cambiar}
        autoFocus
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={LARGO_CODIGO}
        editable={!verificando}
        estiloEntrada={[typography.h1, styles.codigo]}
        validacion={error ? { ok: false, texto: error } : null}
      />
    </PantallaCuenta>
  );
}

const crearEstilos = ({ colors }: Tema) =>
  StyleSheet.create({
    codigo: {
      letterSpacing: sizes.codigoEspaciado,
      textAlign: "center",
    },
    muted: {
      color: colors.inkMuted,
    },
  });
