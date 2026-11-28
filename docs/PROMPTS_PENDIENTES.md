# PROMPTS_PENDIENTES.md — RutaClara

Actualizado: **26 de noviembre de 2026**. Prompts para Claude Code **que todavía no constan como ejecutados**. Todos usan la **alta fidelidad** como referencia visual (página `69:441`).

**Uso de cada prompt:**
1. En la carpeta del proyecto: `claude`.
2. `/clear` antes de cada prompt nuevo (no a mitad de un paso).
3. `Shift + Tab` hasta **plan mode**, pega el prompt, revisa el plan y apruébalo.
4. Verifica con el checklist en el iPhone, haz commit y marca el paso en `ROADMAP.md`.

**Recomendación:** copia estos tres documentos a una carpeta `docs/` del repositorio y agrega a `CLAUDE.md` una línea: «Antes de cada paso, lee `docs/ROADMAP.md` y `docs/RUTACLARA_CONTEXT.md`». Así Claude Code siempre tiene el contexto.

## Índice

| # | Prompt | Estado |
|---|---|---|
| 0 | Arranque: verificar el estado del proyecto | ✅ ejecutado el 22/11 |
| 1 | 4.5A · Tokens y componentes de alta fidelidad | ✅ ejecutado el 22/11 |
| 2 | 4.4 · Ajustes, Mapa de seguridad, Menú lateral | ✅ ejecutado el 24/11 |
| 3 | 4.5B · Pantallas del Flujo 1 en alta fidelidad | ✅ ejecutado el 25/11 |
| 4 | 4.5C · Pantallas de los Flujos 2 y 3 en alta fidelidad | ✅ ejecutado el 25/11 |
| 5 | 4.7 · Estados E1–E10 | ✅ ejecutado el 25/11 |
| 6 | 4.6 + 4.8 · Tema dinámico y módulo de accesibilidad | ✅ (26/11) |
| 7 | 4.9 · Cuenta y eliminación de cuenta | ✅ (26/11) |
| 8 | Revisión de SDK 58 (si no se hizo) | ✅ (26/11) |
| 9 | 5.0 · Proyecto Supabase y cliente | ✅ ejecutado el 26/11 |
| 10 | 5.1 · Esquema, RLS y datos iniciales | ✅ ejecutado el 26/11 |
| 11 | 5.2 · Inicio de sesión con código por correo | ✅ ejecutado el 26/11 |
| 12 | 5.3 · Perfil y cuenta reales | ✅ ejecutado el 26/11 |
| 13 | 5.4 · Reportes reales | ✅ ejecutado el 27/11 |
| 14 | 5.5 · Tiempo real | ✅ ejecutado el 27/11 |
| 15 | 5.6 · Favoritos, alertas y notificaciones en la base (si hay tiempo) | ✅ ejecutado el 27/11 |
| 16 | 5.7 · Correos, fotos y borrado programado (si hay tiempo) | ✅ ejecutado el 27/11 |
| 17 | 6.0 · Mapa real | ✅ ejecutado el 27/11 |
| 18 | 6.1 · Ubicación real | ✅ ejecutado el 27/11 |
| 19 | 6.2 · Mapa interactivo | ✅ ejecutado el 27/11 |
| 20 | 6.3 · Notificaciones locales (si hay tiempo) | ✅ ejecutado el 27/11 |
| — | 7.0 · Clave gratuita de Gemini y Edge Function (lo haces tú) | ✅ (28/11) |
| 21 | 7.1 · Reporte con tus palabras | ✅ ejecutado el 28/11 |
| 22 | 7.2 · Asistente de viaje (si hay tiempo) | 🔨 **en prueba** |
| — | Fase 8 | 🗺️ planificar con Claude Code cuando lleguemos |

**Fase 5 (plan del 26/11):** entrega en menos de 3 semanas → 5.0–5.5 son lo que se ve en la demo; 5.6 y 5.7 solo si hay tiempo. Reglas comunes:
- `src/data/supabase.ts` es el único archivo que importa `@supabase/supabase-js`; las pantallas siguen usando solo `@/data/repositorio` y **las firmas no cambian**.
- SQL versionado en `supabase/migrations/NNN_nombre.sql` y `supabase/seed.sql`; el usuario lo ejecuta en el SQL Editor del dashboard (sin CLI de Supabase).
- Claves en `.env.local` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Nunca la contraseña de la base ni la clave secreta en la app ni en el chat.
- Errores de red → `SinConexionError` (la cola de reportes sigue funcionando); `simulacion.ts` sigue forzando error, vacío y sin red.

---

## 0. Arranque: verificar el estado del proyecto

```
Voy a continuar el proyecto RutaClara contigo. Lee docs/ROADMAP.md,
docs/RUTACLARA_CONTEXT.md y docs/PROMPTS_PENDIENTES.md (o los archivos que te
pase), y CLAUDE.md y AGENTS.md.

No cambies código todavía. Quiero un informe corto:
1. Qué rutas existen en src/app y qué componentes en src/components; marca
   cualquier diferencia con la arquitectura del §6 del contexto.
2. Qué TODO quedan en el código (busca "TODO").
3. Estado de git: rama actual, si actualizar-sdk-58 está unida a main, si
   hay cambios sin commit y si hay remoto configurado.
4. Si CLAUDE.md o AGENTS.md contradicen el contexto (SDK, rutas, reglas);
   propón los cambios, no los apliques.
5. Corre npx tsc --noEmit, npx expo lint y npx expo-doctor y resume.
Desde ahora la referencia visual es la página de alta fidelidad de Figma
(node 69:441), no los wireframes.
```

---

## 1. Paso 4.5A · Tokens y componentes de alta fidelidad

**Por qué primero:** las pantallas de 4.4 y las siguientes nacen con el diseño final, y todo lo existente mejora de una vez sin tocar la lógica.

```
Fase 4, paso 5A: llevar src/theme y src/components a la alta fidelidad. El
proyecto usa Expo SDK 58; instala con "npx expo install". No cambies la
lógica ni las pantallas, salvo lo mínimo para que compilen.

Referencia: sección Componentes de la página de alta fidelidad
https://www.figma.com/design/scCnOTBkUv6axMpU4GiLwc/RutaClara?node-id=69-442
Lee también la tabla "Verificación de contraste" (102:1539).

1. Tokens (src/theme), según RUTACLARA_CONTEXT §7:
   - colors: red pasa a #C93B29; agrega redStrong #B33424, yellowDeep,
     inkPressed, controlOff, block, park, avenue.
   - shadows: card, float, sheet, pin, primary, danger (iOS shadow* y
     elevation en Android) y focusRing.
   - Radios: los componentes usan 16 en Figma. Propón si agregar un token
     o reutilizar uno existente; no rompas la escala sin preguntarme.
2. Componentes (lee cada maestro con el MCP antes de cambiarlo):
   - Button (69:450): variantes Primary/Secondary/Tertiary/Danger y estados
     pressed, disabled y focus; radio 16; sombra en Primary y Danger.
   - Chip (69:459): píldora, Default con borde line, Live/Alert sin borde,
     prop icon opcional (componente de lucide-react-native).
   - Toggle (69:469): pista apagada en controlOff.
   - Tile (69:474): tarjeta con sombra, ícono en círculo de 40 (prop icon),
     Selected con borde ink, Danger en redSoft con borde red.
   - IconButton (73:1005): 44x44, circular, sombra card; mantiene
     tono="destacado".
   - ListItem (73:1007): insignia de 40 con ícono opcional.
   - BottomNav (73:1022): pestaña activa con píldora amarilla 52x30, íconos
     Lucide, borde solo arriba, mantiene el badge de sin leer.
   - Texto rojo o íconos rojos sobre redSoft usan redStrong.
3. Actualiza el catálogo (dev/catalogo) con todas las variantes y estados.

Al final corre npx tsc --noEmit y npx expo lint. Primero muéstrame el plan.
```

**Verifica:** catálogo con estados de botón; botón «Reportar» con el rojo nuevo; BottomNav con píldora amarilla; ninguna pantalla rota.

```bash
git add . && git commit -m "Tokens y componentes de alta fidelidad"
```

---

## 2. Paso 4.4 · Ajustes, Mapa de seguridad, Menú lateral

```
Fase 4, paso 4: F3_05, F3_06 y F3_07 en alta fidelidad, y conectar los TODO
pendientes. Usa el repositorio, los tokens y los componentes existentes.

1. Ajustes, reemplaza la ruta provisional /ajustes (F3_05):
   https://www.figma.com/design/scCnOTBkUv6axMpU4GiLwc/RutaClara?node-id=69-1317
   - Fila de perfil (navega a /cuenta si existe; si no, TODO "4.9").
   - Notificaciones: toggles Alertas de mis rutas, Seguridad cerca de mí,
     Logros y puntos, guardados en preferencias (AsyncStorage).
   - Uso en la calle: Ahorro de datos.
   - Fila "Accesibilidad" (navega a /accesibilidad; TODO "4.8" si no existe).
   - Soporte: Ayuda y preguntas frecuentes, Contáctanos (WhatsApp con
     Linking).
   - "Cerrar sesión" con confirmación (Alert con "Cancelar" / "Cerrar
     sesión"); por ahora reinicia preferencias y vuelve al onboarding.
2. Mapa de seguridad (F3_06):
   https://www.figma.com/design/scCnOTBkUv6axMpU4GiLwc/RutaClara?node-id=69-1378
   - Mapa provisional con zonas según getReportesSeguridad(2) (alto, medio,
     sin reportes); chips de filtro (Todo, Robos, Desorden, Acoso…).
   - La leyenda usa ícono + texto, no solo color.
   - Hoja inferior con el paradero de más reportes y toggle "Evitar zonas
     rojas en mis rutas" (preferencia; solo se guarda).
   - Botón "Reportar" abre /reporte/seguridad.
3. Menú lateral (F3_07):
   https://www.figma.com/design/scCnOTBkUv6axMpU4GiLwc/RutaClara?node-id=69-1428
   - Modal que entra desde la izquierda sobre Inicio con scrim; cierra al
     tocar fuera, con el gesto y con "Atrás". Ítems: Mi perfil, Favoritos,
     Modo offline (TODO), Comunidad y puntos, Mapa de seguridad, Ajustes,
     Soporte, Cerrar sesión (misma confirmación).
4. Conecta: menú ☰ de Inicio → F3_07; chip Seguridad → F3_06; botón de
   ajustes de Perfil y de Alertas → Ajustes; notificación de seguridad →
   F3_06. Actualiza la tabla de rutas de CLAUDE.md.

Estados de carga, vacío y error donde se carguen datos. Lee cada frame con
el MCP antes de escribir código. Al final tsc y lint. Primero el plan.
```

**Verifica:** ☰ abre el menú y se cierra al tocar fuera; chip Seguridad abre el mapa; «Cerrar sesión» pide confirmación; los toggles de Ajustes persisten al recargar.

---

## 3. Paso 4.5B · Pantallas del Flujo 1 en alta fidelidad

```
Fase 4, paso 5B: ajustar las pantallas del Flujo 1 a la alta fidelidad.
Mantén la lógica; cambia solo maquetación y estilos. Una pantalla a la vez,
leyendo cada frame con el MCP:
F1_01 69:487 (logo B) · F1_02 69:498 · F1_03 69:512 · F1_04 69:530 ·
F1_05 69:573 · F1_06 69:667 · F1_07 69:715 · F1_08 69:775 · F1_09 69:813 ·
F1_10 69:853
(https://www.figma.com/design/scCnOTBkUv6axMpU4GiLwc/RutaClara?node-id=X-Y)

Puntos clave:
- Mapa provisional: manzanas, parques y avenida (block, park, avenue);
  paraderos como marcador "P" negro de 28 px; unidades en vivo como burbuja
  amarilla con ícono Bus; mismas props del componente Mapa.
- Inicio: buscador con lupa; chips con ícono; tarjeta "Cerca de ti" con las
  próximas 2 unidades del paradero (usa getResumenParadero).
- Resultados: la ruta recomendada con borde yellowDeep de 2 px y sombra.
- F1_10: los Tile de valoración con caritas Lucide (Angry, Frown, Meh,
  Smile, Laugh).
Al final tsc y lint. Primero el plan con la lista de cambios por pantalla.
```

---

## 4. Paso 4.5C · Pantallas de los Flujos 2 y 3 en alta fidelidad

```
Fase 4, paso 5C: igual que 4.5B, para los Flujos 2 y 3:
F2_01 69:891 · F2_02 69:918 · F2_03 69:935 · F2_04 69:959 · F2_05 69:994 ·
F2_06 69:1026 · F2_07 69:1061 · F2_08 69:1094 · F2_09 69:1116 ·
F3_01 69:1156 · F3_02 69:1185 · F3_03 69:1213 · F3_04 69:1269

Puntos clave:
- Tiles con íconos Lucide (Bus, TrafficCone, Users, Split, ShieldAlert,
  Armchair, Snail, Zap, Gauge, Smile, Frown).
- F2_07: la opción elegida en redSoft con borde red.
- F2_08: tarjeta de progreso de rango (rango actual, puntos, barra y puntos
  que faltan, calculado con las reglas de src/config).
- F2_09: insignias con íconos (Sunrise, Eye, ShieldCheck, Lock gris).
- F3_02: minimapa con marcador "P".
- F3_04: ícono por tipo de notificación.
Al final tsc y lint. Primero el plan.
```

---

## 5. Paso 4.7 · Estados E1–E10

```
Fase 4, paso 7: implementar los estados de la sección Estados de Figma
(https://www.figma.com/design/scCnOTBkUv6axMpU4GiLwc/RutaClara?node-id=95-1503).
Crea un componente EstadoVacio/EstadoError reutilizable (señal visual en
círculo de 104, título, texto, acciones) y úsalo en:

E1 95:1504 Búsqueda sin resultados: sugerencia del destino más parecido
   (distancia de edición simple en buscarDestinos) y "Elegir en el mapa".
E2 95:1544 Carga de Resultados con esqueleto (no spinner).
E3 96:1520 Reporte sin conexión: si crearReporte falla por red, guardar el
   borrador en una cola en AsyncStorage, mostrar E3 y reenviar al volver a
   abrir la app (agrega una opción en dev para simular sin red). Si
   necesitas @react-native-community/netinfo, pregúntame antes.
E4 103:1539 Favoritos vacío · E5 103:1641 Perfil sin historial ·
E6 103:1731 Alertas vacío.
E7 103:1827 Error del sistema en Resultados: Reintentar + WhatsApp.
E8 105:1683 Error de validación en F3_03: mensaje junto a los días, con
   ícono, accessibilityLiveRegion/announceForAccessibility.
E9 105:1760 Ruta no disponible (agrega una línea suspendida a los mocks).
E10 105:1849 Inicio sin permiso de ubicación: reemplaza el banner actual.

Todos conservan encabezado o barra inferior. En dev/datos agrega
interruptores para forzar error, vacío y sin red. Al final tsc y lint.
Primero el plan.
```

---

## 6. Pasos 4.6 + 4.8 · Tema dinámico y módulo de accesibilidad

```
Fase 4, pasos 6 y 8: tema dinámico y pantalla de accesibilidad.

1. Tema (4.6): un ThemeProvider con useTema() que entregue la paleta según
   la preferencia: Sistema / Claro / Oscuro, más un modo Alto contraste.
   Paletas en RUTACLARA_CONTEXT §7 (RC-HF-Dark, RC-HF-HC). El texto sobre
   amarillo siempre es oscuro. Migra los StyleSheet a estilos que dependan
   del tema (por ejemplo, un makeStyles(tema)). Configura
   "userInterfaceStyle": "automatic" en app.json y StatusBar automática.
   Referencias: Inicio oscuro 93:1350, Detalle 93:1429, Alertas 93:1463;
   alto contraste P1 108:1868.
2. Accesibilidad (4.8), ruta /accesibilidad desde Ajustes:
   A1 106:1837 (desactivado) y A2 106:1913 (activado).
   - Tamaño de texto 100–200 % con A− / A+ y vista previa; respeta también
     el tamaño del sistema; las pantallas se desplazan sin cortar texto
     (referencia P2 108:2016).
   - Alto contraste (paleta HC, sin sombras, bordes de 2 px).
   - Reducir movimiento: desactiva animaciones y usa fundidos;
     respeta AccessibilityInfo.isReduceMotionEnabled.
   - Señales sin depender del color: agrega ícono y texto a niveles y
     estados (mapa de seguridad, chips de ocupación).
   Preferencias en AsyncStorage.
Hazlo en dos partes (primero el tema, luego la pantalla) y avísame entre
ambas. Al final tsc y lint. Primero el plan.
```

---

## 7. Paso 4.9 · Cuenta y eliminación de cuenta

```
Fase 4, paso 9: flujo de cuenta con datos simulados en el repositorio
(firmas listas para Supabase en la Fase 5):
D1 109:1928 Mi cuenta · D2 109:1992 advertencia (qué se elimina y qué se
conserva) · D3 109:2047 alternativa (desactivar temporalmente) · D4 109:2088
confirmación escribiendo ELIMINAR (validación con texto e ícono, orden de
foco campo → Eliminar → Cancelar) · D5 109:2118 periodo de gracia de 30 días
con "Cancelar eliminación".
Repositorio: getCuenta, desactivarCuenta, solicitarEliminacion (devuelve la
fecha efectiva), cancelarEliminacion. Desde Ajustes → perfil. Al final tsc
y lint. Primero el plan.
```

---

## 8. Revisión posterior a SDK 58 (solo si no se hizo)

Confirma antes con `git branch` y `git log --oneline -5`. El prompt 0 lo verifica.

```
Actualicé de SDK 57 a 58 y expo-doctor pasa 20/20. Revisa en el changelog
oficial de Expo SDK 58 los cambios incompatibles que afectan a expo-router,
expo-font, safe-area-context, react-native-svg, lucide-react-native,
react-native-gesture-handler (v2 → v3) y usePreventRemove. Actualiza
CLAUDE.md a SDK 58. Dime qué cambiaste y por qué.
```

---

## 9. Paso 5.0 · Proyecto Supabase y cliente

Antes, el usuario crea el proyecto (guía en `ROADMAP.md`, Fase 5) y pone la URL y la publishable key en `.env.local`.

```
Fase 5, paso 0: conectar la app a Supabase. El proyecto usa Expo SDK 58;
instala con "npx expo install".
- Instala @supabase/supabase-js (aprobado en el plan de la Fase 5).
- src/data/supabase.ts: createClient con EXPO_PUBLIC_SUPABASE_URL y
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY; auth con storage AsyncStorage,
  autoRefreshToken, persistSession, detectSessionInUrl: false; listener de
  AppState (startAutoRefresh / stopAutoRefresh). Si faltan las variables,
  error claro en desarrollo.
- .env.example con las dos variables vacías; verifica que .gitignore ignora
  .env.local.
- /dev/datos: fila "Conexión con Supabase" que hace una consulta mínima y
  muestra OK o el error.
Lee antes https://docs.expo.dev/guides/using-supabase/. Al final tsc, lint y
expo-doctor. Primero el plan.
```

---

## 10. Paso 5.1 · Esquema, RLS y datos iniciales

```
Fase 5, paso 1: base de datos. Escribe el SQL en supabase/migrations/
(001_catalogo.sql, 002_usuario.sql, 003_funciones.sql) y supabase/seed.sql;
yo lo ejecuto en el SQL Editor.
- Catálogo (lectura pública): lineas (con recorrido_ida/vuelta y afluencia),
  paraderos, destinos, vias, busquedas. Seed = los mocks actuales de
  src/mocks, sin cambiar ids.
- Usuario (RLS: cada uno ve y edita lo suyo): perfiles (nombre, telefono,
  puntos, eliminacion_el, desactivada), lineas_favoritas,
  paraderos_favoritos, lugares, alertas, notificaciones.
- reportes: lectura para usuarios autenticados (sin usuario_id si es
  anónimo), inserción solo por la RPC crear_reporte (suma puntos según
  PUNTOS_POR_TIPO, replicado en SQL). Publicación supabase_realtime.
- Trigger en auth.users que crea el perfil. Función refrescar_demo() que
  vuelve a fechar los reportes de ejemplo como en src/mocks/reportes.ts.
- src/data/catalogo.ts: carga el catálogo una vez y lo deja en memoria; el
  repositorio deja de importar los mocks del catálogo (mismas firmas).
- Botón "Refrescar datos de demo" en /dev/datos.
Al final tsc y lint. Primero el plan.
```

---

## 11. Paso 5.2 · Inicio de sesión con código por correo

Figma no tiene pantallas de login: se arman con los componentes existentes (estilo de D4) y se marcan `// supuesto`.

```
Fase 5, paso 2: login con OTP por correo (signInWithOtp + verifyOtp
type "email").
- Antes del código: guía para el SMTP de Gmail (verificación en dos pasos,
  contraseña de aplicación, Authentication → Emails → SMTP Settings) y
  plantilla "Magic link or OTP" con {{ .Token }}. Sin SMTP propio Supabase
  no deja editar plantillas y la de fábrica solo trae un enlace.
- /ingresar: correo (validación con ícono + texto, como E8) y "Enviar
  código". /ingresar/codigo: 6 dígitos, "Reenviar código" a los 60 s,
  errores (código incorrecto o vencido, sin conexión). Primera vez:
  "¿Cómo te llamas?" guarda el nombre en perfiles.
- Usa PantallaCuenta, TarjetaCuenta, Button y los tokens; textos en
  español peruano.
- Sesión en un contexto (useSesion); Stack.Protected: sin onboarding →
  onboarding; sin sesión → ingresar; con sesión → app.
- useCerrarSesion, "Desactivar" (D3) y "Entendido" (D5) llaman a
  supabase.auth.signOut().
Al final tsc y lint. Primero el plan.
```

---

## 12. Paso 5.3 · Perfil y cuenta reales

```
Fase 5, paso 3: getUsuario, getCuenta, desactivarCuenta,
solicitarEliminacion y cancelarEliminacion contra la tabla perfiles (correo
de la sesión, enmascarado). Historial (F2_09) e insignias con los reportes
propios. Mismas firmas. Al final tsc y lint. Primero el plan.
```

---

## 13. Paso 5.4 · Reportes reales

```
Fase 5, paso 4: crearReporte llama a la RPC crear_reporte (devuelve puntos,
total y usuario); las lecturas de reportes (Inicio, Detalle de paradero,
Monitoreo, unidades en vivo, mapa de seguridad y zonas) salen de la tabla
reportes. Error de red → SinConexionError para que la cola (E3) siga
funcionando. Mismas firmas. Al final tsc y lint. Primero el plan.
```

---

## 14. Paso 5.5 · Tiempo real

```
Fase 5, paso 5: hook useReportesEnVivo() con un canal postgres_changes
(INSERT en reportes) que avisa a Inicio, Detalle de paradero, Monitoreo y
Mapa de seguridad para recargar. Cerrar el canal al salir de la pantalla y
al pasar a segundo plano. Al final tsc y lint. Primero el plan.
```

---

## 15. Paso 5.6 · Favoritos, alertas y notificaciones en la base (si hay tiempo)

```
Fase 5, paso 6: favoritos (líneas y paraderos), lugares guardados, alertas
diarias y notificaciones pasan de memoria a sus tablas; simularAvisoAlerta
inserta en notificaciones. Mismas firmas. Al final tsc y lint. Primero el
plan.
```

---

## 16. Paso 5.7 · Correos, fotos y borrado programado (si hay tiempo)

```
Fase 5, paso 7 (el SMTP de Gmail ya se configuró en el 5.2): plantilla de verificación
según el frame de Figma 111:2098; fotos de reportes en Supabase Storage;
Edge Function programada que borra las cuentas al vencer los 30 días.
Primero el plan.
```

---

## Fase 6 · Reglas comunes (prompts 17–20)
- Expo Go en iPhone: nada que necesite *development build*. Instalar solo con `npx expo install` y lo aprobado (`react-native-maps` en 6.0, `expo-notifications` en 6.3).
- Las pantallas siguen usando `Mapa` y `@/data/repositorio` con las mismas firmas.
- Tokens y componentes existentes; modo oscuro, alto contraste, «reducir movimiento» y «señales sin color» siguen funcionando.
- Lo que no está en Figma va `// supuesto`.

---

## 17. Paso 6.0 · Mapa real

```
Fase 6, paso 0: mapa real. El proyecto usa Expo SDK 58; instala con
"npx expo install react-native-maps".
- Reescribe src/components/Mapa.tsx con MapView de react-native-maps sin
  cambiar sus props (lo usan 9 pantallas): usuario (punto azul con halo),
  paraderos (marcador «P» o punto), unidades (burbuja amarilla / chip como
  marcador personalizado), recorrido (Polyline recta), seguimiento
  (Polyline punteada), zonas de seguridad (Circle rojo/ámbar), rótulos y
  etiquetas (chips sobre el mapa). Encuadre automático de los puntos.
- Modo oscuro con userInterfaceStyle; sin animación de cámara con
  «reducir movimiento»; el mapa es decorativo para el lector de pantalla
  (la información sigue en las listas).
- Lee con el MCP los frames F1_04 (69:530), F1_08 (69:775), F3_02 (69:1185)
  y F3_06 (69:1378) para los marcadores.
Al final tsc, lint y expo-doctor. Primero el plan.
```

---

## 18. Paso 6.1 · Ubicación real

```
Fase 6, paso 1: ubicación real con expo-location (ya instalado).
- getUbicacionUsuario() usa la ubicación del celular en primer plano si hay
  permiso; si no, o si está activo «Usar ubicación de prueba» (nuevo
  interruptor en /dev/datos, encendido por defecto para la demo), usa
  ubicacionUsuario de los mocks.
- crearReporte (posición por defecto) y las líneas sugeridas usan la misma
  ubicación. El banner de permiso de F1_04 ya existe.
Al final tsc y lint. Primero el plan.
```

---

## 19. Paso 6.2 · Mapa interactivo

```
Fase 6, paso 2: mapa interactivo.
- F2_04 (69:959) «Confirmar ubicación»: arrastrar el mapa con un pin fijo al
  centro; la posición elegida va al borrador (posicion).
- Inicio (F1_04, 69:530): botón «centrar en mí».
- Resultados (F1_06, 69:667): marcador del destino.
Lee cada frame con el MCP antes de escribir código. Al final tsc y lint.
Primero el plan.
```

---

## 20. Paso 6.3 · Notificaciones locales (si hay tiempo)

```
Fase 6, paso 3: notificaciones locales con expo-notifications (instalar con
npx expo install; push remoto fuera: necesita development build).
- F1_08: «¡Tu carro está llegando!» y F1_09: aviso para bajar, como
  notificación local si la app está en segundo plano.
- Alertas diarias (F3_03): recordatorio local programado (días y hora menos
  minutosAntes); se reprograma al guardar o eliminar una alerta.
- Permiso pedido en contexto (al activar una alerta o iniciar el viaje).
Al final tsc, lint y expo-doctor. Primero el plan.
```

---

## 7.0 · Clave gratuita de Gemini y Edge Function (lo haces tú, guiado)

Antes del prompt 21. Claude Code escribe el código (`supabase/functions/interpretar-reporte/index.ts` y `supabase/migrations/007_ia.sql`) en el paso 7.1; tú lo subes:
1. **aistudio.google.com:** entra con tu cuenta de Google → **Get API key** → crea la clave (plan gratuito, sin tarjeta; no actives la facturación). El código usa `gemini-3.5-flash-lite` (gratuito al 28/11); si AI Studio ya no lo ofrece gratis, anota el nombre del modelo Flash gratuito. **No pegues la clave en el chat ni en la app.**
2. **Supabase → Edge Functions → Secrets:** agrega `GEMINI_API_KEY` con esa clave (y `GEMINI_MODEL` solo si el modelo gratuito es distinto al del código).
3. **SQL Editor:** ejecuta `supabase/migrations/007_ia.sql` (tabla `uso_ia` con el límite diario).
4. **Edge Functions → Deploy a new function → Via editor:** nombre `interpretar-reporte`, pega todo `supabase/functions/interpretar-reporte/index.ts` y despliega. Deja activado «Verify JWT» (solo usuarios con sesión).
5. Prueba con el botón **Test** del Dashboard (con sesión de un usuario) o desde la app en el paso 7.1.

---

## 21. Paso 7.1 · Reporte con tus palabras

```
Fase 7, paso 1: reporte con tus palabras (IA). El proyecto usa Expo SDK 58;
no instales librerías nuevas en la app.
- Edge Function supabase/functions/interpretar-reporte/index.ts (Deno, IA
  gratuita: Gemini API con el SDK oficial npm:@google/genai, clave en el
  secreto GEMINI_API_KEY, modelo Flash del plan gratuito en una constante o
  en el secreto GEMINI_MODEL): exige sesión, máx. 280 caracteres y 30 usos
  por usuario al día (tabla uso_ia en supabase/migrations/007_ia.sql con
  RLS). Salida estructurada (responseSchema) con los valores cerrados de
  BorradorReporte (tipo, lineaId del catálogo, ocupacion, velocidad, espera,
  congestion, causas, seguridad) + entendido y falta. Si Gemini responde 429
  o falla: error «La IA está ocupada». Revisa la documentación actual del
  SDK @google/genai antes de escribirla.
- src/data/supabase.ts: interpretarReporte(texto) con functions.invoke;
  el repositorio la expone y traduce errores (sin red, límite, no entendí).
- F2_01 (reporte/index.tsx): opción «Cuéntalo con tus palabras» →
  reporte/texto.tsx (supuesto, sin frame: componentes existentes). Campo de
  texto con pista «Ej.: La 50 viene llena por Javier Prado · usa el
  micrófono del teclado para dictar», botón «Armar reporte», estado
  «Entendiendo tu reporte…». Con la respuesta: actualizar(...) del borrador y
  navegar al paso que corresponde con las opciones ya marcadas; el usuario
  confirma como siempre (la IA nunca envía). Si no entendió, se llegó al
  límite o la IA está ocupada: mensaje + «Reportar paso a paso». Nota bajo
  el campo: «No escribas datos personales».
- Seguridad: pasa por reporte/seguridad.tsx como siempre (nunca tocar
  «Llamar» en pruebas).
Al final tsc y lint, y la guía para subir la función (7.0). Primero el plan.
```

---

## 22. Paso 7.2 · Asistente de viaje (si hay tiempo)

```
Fase 7, paso 2: asistente de viaje. Misma Edge Function con un modo
"viaje": una frase («Quiero llegar al Jockey a las 8 y que me avises») →
acción propuesta con salida estructurada: buscar_rutas (destinoId del
catálogo) o crear_alerta (destino, hora, minuto, dias, minutosAntes).
- Entrada: botón en el buscador de F1_05 (buscar.tsx), mismo campo de texto
  y dictado que en 7.1.
- La app abre la pantalla con los datos llenos: F1_06 (/rutas con destino) o
  F3_03 (/alerta con los campos precargados); el usuario confirma. Nada se
  guarda sin confirmación.
- Mismos límites y errores que en 7.1.
Al final tsc y lint. Primero el plan.
```

---

## Fases sin prompt (planificar con Claude Code al llegar)

- **Fase 8 · Entrega:** repositorio en GitHub con README; acceso (EAS Update + QR, o web en Vercel); prueba de usabilidad con la app real (guion: https://claude.ai/artifact/PW6XL7MeJCXTYdc61sMJiF); PPT; guion de la demo.

## Plantilla de prompt (referencia)
1. `Fase X, paso Y: <tema>.` + «El proyecto usa Expo SDK 58; instala con "npx expo install".»
2. Rutas exactas de archivos.
3. Enlace del frame de **alta fidelidad** con `node-id`.
4. Requisitos: textos, componentes, navegación, estados, accesibilidad.
5. Reglas: solo tokens y componentes existentes; pantallas solo con el repositorio.
6. Cierre: «Lee cada frame con el MCP antes de escribir código. Al final corre npx tsc --noEmit y npx expo lint. Primero muéstrame el plan.»
