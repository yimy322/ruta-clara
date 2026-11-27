# ROADMAP.md — RutaClara

Actualizado: **26 de noviembre de 2026**. Fases y pasos con su estado real. **El estado se basa solo en lo que el usuario reportó.** Que un prompt exista no significa que esté implementado.

## Leyenda de estados

| Estado | Significado |
|---|---|
| ✅ **Completado (confirmado)** | El usuario confirmó que funcionó |
| 🟢 **Completado (implícito)** | Se avanzó a pasos que dependen de este sin problemas, pero no se confirmó su checklist |
| 📝 **Prompt preparado** | Hay prompt en `PROMPTS_PENDIENTES.md`; no consta que se haya ejecutado |
| 🗺️ **Solo alcance** | Definido a alto nivel; sin prompt |
| ❓ **Desconocido** | No hay información suficiente |

## Dónde estamos

- **Código (Expo):** completos los Flujos 1, 2 y 3 (hasta el **paso 4.4**) y los tokens y componentes de alta fidelidad (4.5A). Todas las pantallas existentes en alta fidelidad (4.5B y 4.5C). Estados E1–E10 implementados (4.7). Tema dinámico y módulo de accesibilidad listos (4.6 + 4.8). Cuenta y eliminación de cuenta lista (4.9). **Fase 4 completa.** Fase 5 (Supabase) en curso: 5.0 ✅ (proyecto y cliente), 5.1 ✅ (esquema, RLS y catálogo remoto); **5.2** (login con código por correo) escrito, falta configurar el SMTP y probar.
- **Diseño (Figma):** **alta fidelidad terminada** en la página «RutaClara · Alta fidelidad» (incluye todo lo del AP3). Desde ahora **la referencia visual para el código es la alta fidelidad**, no los wireframes.
- **Académico:** AP2 y AP3 entregados. Queda el **Proyecto Final**: un **MVP funcional** (no solo Figma), PPT, repositorio o acceso, y demostración en vivo. Fecha de entrega: **❓ por confirmar**.

---

## Resumen

| ID | Paso | Estado |
|---|---|---|
| D1 | Wireframes en Figma (26 pantallas, 3 flujos) | ✅ |
| D2 | Prototipo de wireframes (124 interacciones) | ✅ |
| D3 | Íconos en wireframes | ✅ (reemplazados por Lucide en alta fidelidad) |
| D4 | Logo | ✅ **Concepto B (monograma R)** elegido y usado en F1_01 |
| D5 | Informe AP2 + plantilla heurística | ✅ entregado |
| D6 | Evaluación del experto y pruebas con usuarios (AP2) | ⚠️ **Autoevaluación** del usuario; **no hubo pruebas con usuarios** |
| D7 | Alta fidelidad en Figma (página propia, componentes, 26 pantallas) | ✅ |
| D8 | AP3: estados, accesibilidad, eliminación de cuenta, correos, comparación, informe | ✅ |
| D9 | Prueba con un usuario (guion listo) | 📝 recomendada; no consta que se haya hecho |
| 1.1–1.6 | Entorno, Expo, Figma MCP, CLAUDE.md | ✅ |
| 2.1–2.5 | Tokens, componentes, catálogo, ESLint | ✅ |
| 3.1–3.5B | Flujo 1 completo + onboarding y permisos | ✅ / 🟢 |
| I3 | Actualización a SDK 58 | ✅ commit `353ee42` en `main` y subido; doctor 20/20 (22/11); changelog revisado (26/11) |
| R1 | README y `.gitignore` | ✅ subidos; «Avance» actualizado el 22/11 |
| 4.1A–B | Reporte de ubicación (F2_01–F2_04, F2_08) | ✅ |
| 4.2A | Paradero (F2_05) + Tránsito (F2_06) | ✅ |
| 4.2B | Seguridad (F2_07) + Perfil (F2_09) | ✅ |
| 4.3A | Detalle de paradero (F3_02) + Configurar alerta (F3_03) | ✅ |
| 4.3B | Favoritos (F3_01) + Centro de notificaciones (F3_04) | ✅ |
| 4.5A | Tokens y componentes de alta fidelidad | ✅ (22/11) |
| 4.4 | Ajustes, Mapa de seguridad, Menú lateral (F3_05–F3_07) + TODO | ✅ (24/11) |
| 4.5B | Pantallas del Flujo 1 en alta fidelidad | ✅ (25/11) |
| 4.5C | Pantallas de los Flujos 2 y 3 en alta fidelidad | ✅ (25/11) |
| 4.7 | Estados E1–E10 en la app | ✅ (25/11) |
| 4.6 | Tema dinámico (claro, oscuro, alto contraste, escala de texto) | ✅ (26/11) |
| 4.8 | Módulo de accesibilidad (A1/A2) | ✅ (26/11) |
| 4.9 | Cuenta y eliminación de cuenta (D1–D5) con datos simulados | ✅ (26/11) |
| 5.0 | Proyecto Supabase y cliente | ✅ (26/11) |
| 5.1 | Esquema, RLS y datos iniciales (seed con los mocks) | ✅ (26/11) |
| 5.2 | Inicio de sesión con código por correo | 🔨 **en prueba** |
| 5.3 | Perfil y cuenta reales | 📝 |
| 5.4 | Reportes reales | 📝 |
| 5.5 | Tiempo real | 📝 |
| 5.6 | Favoritos, alertas y notificaciones en la base | 📝 si hay tiempo |
| 5.7 | Plantilla de correo según Figma, fotos en Storage, borrado programado | 📝 si hay tiempo |
| 6 | Mapa real, ubicación real y notificaciones | 🗺️ |
| 7 | Inteligencia artificial (puntos adicionales del Proyecto Final) | 🗺️ propuesta |
| 8 | Entrega final: despliegue, prueba de usabilidad, PPT y demo | 🗺️ |

## Orden recomendado para el Proyecto Final

El Proyecto Final evalúa un **MVP funcional, usable e innovador**, no solo la apariencia. Orden propuesto (se puede ajustar cuando se conozca la fecha):

1. **4.5A** tokens y componentes de alta fidelidad → así las pantallas nuevas nacen con el diseño final.
2. **4.4** completar las pantallas que faltan del Flujo 3.
3. **4.5B y 4.5C** pasar las pantallas existentes a alta fidelidad.
4. **4.7** estados (muestra usabilidad y manejo de errores en la demo).
5. **4.6 + 4.8** tema dinámico y módulo de accesibilidad (diseño inclusivo).
6. **Fase 5** Supabase (datos reales, tiempo real) → cumple «integración de tecnologías y servicios».
7. **Fase 7** IA (puntos adicionales).
8. **Fase 8** despliegue, prueba de usabilidad con la app real, PPT y demo.
9. Si hay tiempo: **4.9** eliminación de cuenta y **Fase 6** mapa real.

---

## Fase D — Diseño y entregables académicos

### D1–D3 · Wireframes y prototipo (AP2)
- Página «RutaClara · Prototipo» (`0:1`). 26 frames, 124 interacciones. **No se edita más**: es la versión evaluada en el AP2.

### D4 · Logo
- ✅ Concepto B (monograma «R», tipografía Sora). En F1_01 de la alta fidelidad.

### D6 · Evaluación AP2
- La matriz heurística la llenó el propio usuario (no un profesional externo). No hubo pruebas con usuarios.
- **Regla:** no se inventan resultados de usuarios ni de expertos. En los informes se declara «revisión heurística del diseñador».

### D7 · Alta fidelidad
- ✅ Página «RutaClara · Alta fidelidad» (`69:441`), independiente de los wireframes: estilos propios `RC-HF/*`, componentes propios, prototipo navegable con 5 puntos de inicio. Detalle en `RUTACLARA_CONTEXT.md` §7.

### D8 · AP3
- ✅ Botones con estados, tabla de contraste WCAG, 11 estados (E1–E10 + Éxito), módulo de accesibilidad (A1, A2, P1, P2), eliminación de cuenta (D1–D5), 4 correos con versión en texto, comparación AP2 → AP3, propuesta de modo oscuro.
- Informe AP3 (Claude Doc): https://claude.ai/artifact/HvT7UWB2B5pn1rg9EGGZ6q — tiene 2 comentarios abiertos (AP1 y confirmación de «Cerrar sesión»).

### D9 · Prueba con usuario
- Guion (Claude Doc): https://claude.ai/artifact/PW6XL7MeJCXTYdc61sMJiF
- 📝 No consta que se haya hecho. Para el Proyecto Final conviene hacerla **con la app real** (Fase 8).

---

## Fases 1–3 · Entorno, sistema de diseño y Flujo 1
✅ Completas. Detalle histórico en `RUTACLARA_CONTEXT.md` (§6 y §10). Pendientes menores de esa etapa:
- I3: la actualización está en `main` (no existe rama aparte). Revisión del changelog hecha el 26/11 (prompt 8): el único cambio necesario fue `usePreventRemove` en `alerta.tsx` (condición en false + `repeat()`); lo demás (Stack.Protected, safe-area, gesture-handler v3, svg, lucide, splash, RN 0.88) no afecta al código.
- R1: la tabla «Equipo» del README lleva solo al usuario (proyecto individual).

## Fase 4 · Flujos 2 y 3 + alta fidelidad en código

### 4.1–4.3 ✅
- 4.1: reporte de ubicación con `ReporteContext`, puntos y rangos.
- 4.2: paradero, tránsito (con `expo-image-picker`), seguridad (long-press 2 s, `expo-haptics`, modal «¿Llamar al 105?», `accessibilityAction`) y perfil.
- 4.3A: `/paradero/[id]` (F3_02) y `/alerta` (F3_03, modal, `@react-native-community/datetimepicker`); paraderos favoritos y alertas en memoria.
- 4.3B: Favoritos (F3_01) y Centro de notificaciones (F3_04) con badge «sin leer» en el BottomNav y botón de desarrollo «Simular aviso de alerta».

### 4.5A · Tokens y componentes de alta fidelidad — ✅
Actualizar `src/theme` y `src/components` a los estilos y componentes de la página de alta fidelidad. Sin tocar la lógica.

### 4.4 · Ajustes, Mapa de seguridad, Menú lateral — ✅
F3_05, F3_06, F3_07 y conectar los TODO (menú ☰, chip Seguridad, `/ajustes` provisional). Incluye la confirmación de «Cerrar sesión» (mejora pendiente del AP2).

### 4.5B / 4.5C · Pantallas en alta fidelidad — ✅
Pantalla por pantalla contra los frames de alta fidelidad. Incluye la tarjeta de Inicio con próximas unidades, marcadores «P», burbujas de unidades y el esqueleto de carga entre Búsqueda y Resultados.

### 4.7 · Estados — ✅
E1–E10 de la sección «Estados» de Figma, conectados a condiciones reales de la app.

### 4.6 · Tema dinámico — ✅
`TemaProvider` con `useTema()` / `useEstilos()`: paletas clara, oscura y alto contraste, sombras por tema (borde negro de 2 en alto contraste) y escala de texto. Apariencia Sistema / Claro / Oscuro en Ajustes.

### 4.8 · Módulo de accesibilidad — ✅
Pantalla `/accesibilidad` (A1/A2): texto hasta 200 %, alto contraste 7:1, reducir movimiento (`useReducirMovimiento`, también el del sistema) y señales sin depender del color (`PildoraNivel`, íconos en el mapa, segmentos, «siguiente», «Nuevo»). Preferencias persistentes. Pendiente menor: al 200 % las filas de próximas unidades de F3_02 no apilan la hora como en P2.

### 4.9 · Cuenta y eliminación — ✅
D1–D5 (`/cuenta`, `/cuenta/eliminar/*`) con `getCuenta`, `desactivarCuenta`, `solicitarEliminacion` (fecha = hoy + 30 días) y `cancelarEliminacion` simuladas en el repositorio; se conectan a Supabase en la Fase 5. Supuestos: edición de datos y «Descargar mis datos» muestran «pronto»; desactivar y «Entendido» cierran sesión; Mi cuenta muestra un aviso para cancelar la eliminación pendiente.

## Fase 5 · Backend con Supabase — 📝 (planificada el 26/11)
Entrega en **menos de 3 semanas**: 5.0–5.5 son lo que se ve en la demo; 5.6–5.7 solo si hay tiempo. Prompts 9–16 en `PROMPTS_PENDIENTES.md`.

**Decisiones:** login con **código de 6 dígitos por correo** (OTP); datos iniciales = **los mocks actuales** (las líneas reales quedan para después); sesión en AsyncStorage (ya instalado); sin PostGIS por ahora (Haversine en el cliente); SQL versionado en `supabase/` y ejecutado en el SQL Editor; pantallas de login con componentes existentes (Figma no las tiene).

**Arquitectura:** `src/data/supabase.ts` es el único que importa supabase-js; el repositorio mantiene las firmas. El catálogo se carga una vez y queda en memoria (`src/data/catalogo.ts`); los datos del usuario van en tablas con RLS; `crear_reporte` (RPC) inserta y suma puntos; `refrescar_demo()` mantiene «en vivo» los reportes de ejemplo para la demo.

**Límite importante:** el correo incluido en Supabase manda solo 2 correos por hora y **solo a correos del equipo del proyecto**. Para desarrollar alcanza con tu correo; **antes de la prueba con otras personas hay que configurar SMTP propio**. Además, desde 26/11 Supabase **no deja editar las plantillas sin SMTP propio** y la plantilla por defecto solo trae un enlace (sin el código), así que el SMTP de Gmail se configura **al inicio del 5.2**.

### 5.0 · Guía para crear el proyecto (lo haces tú)
1. Entra a https://supabase.com y crea una cuenta (puede ser con GitHub).
2. **New project** → nombre `rutaclara`, plan **Free**, región **South America (São Paulo)**. Genera la contraseña de la base de datos y **guárdala en tu gestor de contraseñas; no la pegues en el chat ni en el código**.
3. Cuando termine de crearse: **Project Settings → API** (o «API Keys»). Copia la **Project URL** y la **publishable key** (la pública; nunca la `service_role` ni la secreta).
4. En la raíz del proyecto crea `.env.local` con:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
   (`.gitignore` ya ignora `.env.*`, así que no se sube.)
5. ~~Plantilla Magic Link con `{{ .Token }}`~~: no se puede editar sin SMTP propio; pasa al inicio del 5.2 (SMTP de Gmail + plantilla con el código).
6. Avísame y ejecutamos el prompt 9.

### 5.1 · Ejecutar el SQL (lo haces tú)
En el dashboard: **SQL Editor → New query**. Pega y ejecuta (**Run**) cada archivo, en este orden; todos se pueden volver a correr:
1. `supabase/migrations/001_catalogo.sql` — catálogo con lectura pública.
2. `supabase/migrations/002_usuario.sql` — perfiles, favoritos, lugares, alertas, notificaciones y reportes con RLS; `reportes` en tiempo real.
3. `supabase/migrations/003_funciones.sql` — perfil + datos de demo al registrarse, `crear_reporte` y `refrescar_demo`.
4. `supabase/seed.sql` — los mocks (generado desde `src/mocks`; si cambian los mocks, se regenera).

El catálogo se lee una vez (`src/data/catalogo.ts`) y queda guardado en el teléfono para usarlo sin red. «Refrescar» en `/dev/datos` vuelve a fechar los reportes de ejemplo.

### 5.2 · Correo con código (lo haces tú, una vez)
1. **Contraseña de aplicación de Gmail:** en tu cuenta de Google activa la verificación en dos pasos; luego en https://myaccount.google.com/apppasswords crea «RutaClara». Copia las 16 letras **solo en Supabase** (nunca en el chat ni en el código).
2. **Authentication → Emails → SMTP Settings** → Enable custom SMTP: host `smtp.gmail.com`, puerto `465`, usuario y sender email = tu Gmail, contraseña = la de aplicación, sender name `RutaClara`.
3. **Authentication → Sign In / Providers → Email:** Email OTP Expiration `600` y Email OTP Length `6`.
4. **Authentication → Emails → Magic link or OTP** y también **Confirm sign up** (el primer correo de una cuenta nueva usa esa plantilla): asunto `Tu código de RutaClara: {{ .Token }}`; cuerpo = `supabase/plantillas/codigo.html` (Source).
5. **Authentication → Rate Limits:** emails por hora en 30 o más.

Flujo: onboarding → `/ingresar` (correo) → `/ingresar/codigo` (6 dígitos) → la primera vez `/ingresar/nombre` → Inicio. La sesión queda guardada; «Cerrar sesión», «Desactivar» (D3) y «Entendido» (D5) cierran la sesión de Supabase.

## Fase 6 · Mapa real, ubicación y notificaciones — 🗺️
**Pendiente decidir:** proveedor de mapa. Restricción de Expo Go: `react-native-maps` sí funciona en Expo Go; MapLibre necesita un *development build*. Las notificaciones push remotas también requieren *development build*.

## Fase 7 · Inteligencia artificial — 🗺️ propuesta (sin aprobar)
Puntos adicionales del Proyecto Final. Dos ideas con utilidad concreta:
- **Reporte por voz o texto libre:** «La 50 viene llena por Javier Prado» → la IA lo convierte en un borrador de reporte (línea, ocupación, ubicación) que el usuario confirma.
- **Agente de viaje:** «Quiero llegar al Jockey a las 8 y que me avises» → el agente usa herramientas (`buscarRutas`, `iniciarEspera`, `guardarAlerta`) y pide confirmación antes de actuar.
- La clave de la API va en el servidor (Supabase Edge Function), nunca en la app.

## Fase 8 · Entrega final — 🗺️
- Repositorio en GitHub con README actualizado.
- Acceso al MVP: EAS Update + código QR para Expo Go, o build web en Vercel. **Pendiente decidir.**
- Prueba de usabilidad con la app real (usar el guion de D9) y pruebas de funcionamiento.
- PPT: proceso de diseño (wireframes → alta fidelidad), arquitectura de información, interfaces principales, tecnologías.
- Guion de la demostración en vivo.

---

## Validaciones estándar de cada paso
```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor            # cuando cambian las dependencias
npx expo start -c          # prueba en el iPhone con Expo Go (SDK 58)
git add . && git commit -m "<paso>"
```
