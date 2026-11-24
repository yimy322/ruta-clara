# PROMPTS_PENDIENTES.md — RutaClara

Actualizado: **22 de noviembre de 2026**. Prompts para Claude Code **que todavía no constan como ejecutados**. Todos usan la **alta fidelidad** como referencia visual (página `69:441`).

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
| 3 | 4.5B · Pantallas del Flujo 1 en alta fidelidad | 📝 siguiente |
| 4 | 4.5C · Pantallas de los Flujos 2 y 3 en alta fidelidad | 📝 |
| 5 | 4.7 · Estados E1–E10 | 📝 |
| 6 | 4.6 + 4.8 · Tema dinámico y módulo de accesibilidad | 📝 |
| 7 | 4.9 · Cuenta y eliminación de cuenta | 📝 |
| 8 | Revisión de SDK 58 (si no se hizo) | ❓ |
| — | Fases 5, 6, 7 y 8 | 🗺️ planificar con Claude Code cuando lleguemos |

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

## Fases sin prompt (planificar con Claude Code al llegar)

- **Fase 5 · Supabase:** decidir login (OTP por correo recomendado por simplicidad), esquema (`usuarios`, `lineas`, `paraderos`, `reportes`, `alertas`, `notificaciones`), Realtime para reportes, RLS, `.env` fuera de Git, reemplazar el interior del repositorio sin cambiar firmas, cola sin conexión real, correos (bienvenida, verificación, eliminación).
- **Fase 6 · Mapa real:** `react-native-maps` funciona en Expo Go; MapLibre y push remoto requieren *development build*.
- **Fase 7 · IA (puntos adicionales):** propuesta: reporte por voz o texto libre que la IA convierte en borrador confirmable, y/o agente de viaje con herramientas (`buscarRutas`, `iniciarEspera`, `guardarAlerta`) que pide confirmación antes de actuar. El modelo se llama desde una Supabase Edge Function.
- **Fase 8 · Entrega:** repositorio en GitHub con README; acceso (EAS Update + QR, o web en Vercel); prueba de usabilidad con la app real (guion: https://claude.ai/artifact/PW6XL7MeJCXTYdc61sMJiF); PPT; guion de la demo.

## Plantilla de prompt (referencia)
1. `Fase X, paso Y: <tema>.` + «El proyecto usa Expo SDK 58; instala con "npx expo install".»
2. Rutas exactas de archivos.
3. Enlace del frame de **alta fidelidad** con `node-id`.
4. Requisitos: textos, componentes, navegación, estados, accesibilidad.
5. Reglas: solo tokens y componentes existentes; pantallas solo con el repositorio.
6. Cierre: «Lee cada frame con el MCP antes de escribir código. Al final corre npx tsc --noEmit y npx expo lint. Primero muéstrame el plan.»
