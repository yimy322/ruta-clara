# ROADMAP.md — RutaClara

Actualizado: **22 de noviembre de 2026**. Fases y pasos con su estado real. **El estado se basa solo en lo que el usuario reportó.** Que un prompt exista no significa que esté implementado.

## Leyenda de estados

| Estado | Significado |
|---|---|
| ✅ **Completado (confirmado)** | El usuario confirmó que funcionó |
| 🟢 **Completado (implícito)** | Se avanzó a pasos que dependen de este sin problemas, pero no se confirmó su checklist |
| 📝 **Prompt preparado** | Hay prompt en `PROMPTS_PENDIENTES.md`; no consta que se haya ejecutado |
| 🗺️ **Solo alcance** | Definido a alto nivel; sin prompt |
| ❓ **Desconocido** | No hay información suficiente |

## Dónde estamos

- **Código (Expo):** completos los Flujos 1, 2 y 3 (hasta el **paso 4.4**) y los tokens y componentes de alta fidelidad (4.5A). Flujo 1 en alta fidelidad (4.5B). Falta pasar los Flujos 2 y 3 (**4.5C**).
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
| I3 | Actualización a SDK 58 | ✅ commit `353ee42` en `main` y subido; doctor 20/20 (22/11) |
| R1 | README y `.gitignore` | ✅ subidos; «Avance» actualizado el 22/11 |
| 4.1A–B | Reporte de ubicación (F2_01–F2_04, F2_08) | ✅ |
| 4.2A | Paradero (F2_05) + Tránsito (F2_06) | ✅ |
| 4.2B | Seguridad (F2_07) + Perfil (F2_09) | ✅ |
| 4.3A | Detalle de paradero (F3_02) + Configurar alerta (F3_03) | ✅ |
| 4.3B | Favoritos (F3_01) + Centro de notificaciones (F3_04) | ✅ |
| 4.5A | Tokens y componentes de alta fidelidad | ✅ (22/11) |
| 4.4 | Ajustes, Mapa de seguridad, Menú lateral (F3_05–F3_07) + TODO | ✅ (24/11) |
| 4.5B | Pantallas del Flujo 1 en alta fidelidad | ✅ (25/11) |
| **4.5C** | **Pantallas de los Flujos 2 y 3 en alta fidelidad** | 📝 **siguiente** |
| 4.7 | Estados E1–E10 en la app | 📝 |
| 4.6 | Tema dinámico (claro, oscuro, alto contraste, escala de texto) | 📝 |
| 4.8 | Módulo de accesibilidad (A1/A2) | 📝 |
| 4.9 | Cuenta y eliminación de cuenta (D1–D5) con datos simulados | 📝 |
| 5 | Backend con Supabase (login, datos reales, tiempo real, correos) | 🗺️ |
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
- I3: la actualización está en `main` (no existe rama aparte). No consta si se hizo la revisión del changelog (prompt 8 de `PROMPTS_PENDIENTES.md`); tsc, lint y doctor pasan.
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

### 4.5B / 4.5C · Pantallas en alta fidelidad — 4.5B ✅ · 4.5C 📝 siguiente
Pantalla por pantalla contra los frames de alta fidelidad. Incluye la tarjeta de Inicio con próximas unidades, marcadores «P», burbujas de unidades y el esqueleto de carga entre Búsqueda y Resultados.

### 4.7 · Estados — 📝
E1–E10 de la sección «Estados» de Figma, conectados a condiciones reales de la app.

### 4.6 · Tema dinámico — 📝
Hook `useTema()` con paletas claro, oscuro y alto contraste, y escala de texto. Base para 4.8.

### 4.8 · Módulo de accesibilidad — 📝
Pantalla `/accesibilidad` (A1/A2): texto hasta 200 %, alto contraste 7:1, reducir movimiento y señales sin depender del color. Preferencias persistentes.

### 4.9 · Cuenta y eliminación — 📝
D1–D5 con funciones simuladas en el repositorio; se conectan a Supabase en la Fase 5.

## Fase 5 · Backend con Supabase — 🗺️
Login, base de datos, reportes en tiempo real, cola sin conexión y correos. **Pendiente decidir:** método de login (OTP por correo, SMS o Google), esquema de datos y carga de 5–10 líneas reales.

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
