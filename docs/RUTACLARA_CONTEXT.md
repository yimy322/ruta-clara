# RUTACLARA_CONTEXT.md

Contexto de producto, diseño y decisiones técnicas de **RutaClara**. Actualizado el **26 de noviembre de 2026**. Úsalo junto con `ROADMAP.md` (estado de cada paso) y `PROMPTS_PENDIENTES.md` (prompts listos para Claude Code).

## 0. Cómo leer este documento

**Roles (desde noviembre de 2026):**
- **Claude Code:** implementa en el proyecto local, lee Figma con el MCP, planifica cada paso y ejecuta las validaciones. Es ahora el colaborador principal.
- **Claude (chat):** planificación, diseño en Figma y documentos académicos. No tiene acceso a la carpeta local.
- **Usuario (Yimy):** desarrollador Java con 3 años de experiencia; programó apps móviles en Java y Kotlin; React a nivel básico. **Trabaja solo** (proyecto individual).

**Etiquetas de origen:** [Usuario] · [Claude chat → aprobado] · [Claude Code → aprobado] · [Propuesta] (sin aprobación).

**Limitaciones:**
- El contenido exacto de `CLAUDE.md`, `AGENTS.md` y del código no se conoce desde el chat. Claude Code debe verificarlo en el proyecto.
- Los nombres de archivos de este documento son los que se pidieron en los prompts; pueden diferir levemente.

---

## 1. Producto

**RutaClara** es una app colaborativa para el **transporte público informal de Lima** (combis, custers y micros). Los pasajeros reportan en tiempo real dónde vienen las unidades, cuánto se espera en el paradero y qué alertas hay en la ruta. Alineada al **ODS 11**.

| Flujo | Objetivo | Pantallas |
|---|---|---|
| **F1 · Búsqueda y viaje en vivo** | Buscar cómo llegar y seguir la unidad hasta bajar | F1_01–F1_10 |
| **F2 · Reporte colaborativo** | Aportar datos en ≤ 3 toques desde el paradero o a bordo | F2_01–F2_09 |
| **F3 · Favoritos y alertas** | Armar la rutina una vez y recibir alertas automáticas | F3_01–F3_07 |

- **F1:** F1_01 → F1_02 → F1_03 → F1_04 → F1_05 → (E2 carga) → F1_06 → F1_07 → F1_08 → F1_09 → F1_10 → F1_04.
- **F2:** entradas desde el FAB «Reportar» (F1_04), F1_08, F1_09 y la tab Reportar. Ramas: Ubicación F2_02 → F2_03 → F2_04; Paradero F2_05; Tránsito F2_06; Seguridad F2_07. Todas terminan en F2_08.
- **F3:** F3_01 → F3_02 → F3_03 → F3_04 (aviso) → F1_08. Soporte: F3_05 Ajustes, F3_06 Mapa de seguridad, F3_07 Menú lateral.
- **Complementarios (AP3):** Accesibilidad (A1/A2) y Eliminación de cuenta (D1–D5), desde Ajustes.

## 2. Usuarios

- Pasajeros de 18 a 35 años que usan transporte informal en Lima.
- Usuario de prueba: **«Rosa M.»**, Cazador de Combis, 1240 pts, 47 reportes del mes, 92 % confirmados.
- Los reportes se publican **sin el nombre** del usuario.

## 3. Reglas de negocio

| Regla | Detalle |
|---|---|
| Puntos por reporte | ubicación 15, paradero 10, tránsito 15, seguridad 10, valoración 5 (`src/config`) |
| Rangos | Pasajero Junior (0), Cazador de Combis (1000), Rey del Paradero (1500) |
| Reporte anónimo | En seguridad, «Alerta anónima» activada por defecto |
| Compartir en tiempo real | Solo a bordo; se apaga a los 30 min |
| Alerta urgente | Mantener 2 s → «¿Llamar al 105?» → F2_08. **Nunca tocar «Llamar» en pruebas** |
| Ruta sin reportes | «Estimado», ETA «~20 min» en gris |
| Frescura de datos | < 5 min = «en vivo»; 5–30 min = «reportado hace N min»; > 30 min = sin datos. Chip Live de ocupación si el reporte tiene < 15 min. Constantes en `src/config` |
| Avísame para bajar | Vibra un paradero antes; activado por defecto |
| Alertas diarias | Hora (intervalos de 5 min), días (L–V por defecto), ruta, aviso a 3/5/10 min, tránsito y seguridad |
| Sin señal | El reporte se guarda en cola (AsyncStorage) y se envía al reconectar (NetInfo) o al reabrir la app (E3, implementado en 4.7) |
| Eliminación de cuenta | Periodo de gracia de 30 días; se conservan reportes anónimos 12 meses y el registro de la solicitud 6 meses (diseñado; no implementado) |
| Onboarding | Solo la primera vez |
| ETA simulada | 12 km/h; ETA cada 5 s; avance de paradero cada 4 s (`src/config/simulacion.ts`) |

## 4. Contexto académico

- Curso **Interacción Hombre-Máquina**, UTP. Proyecto individual.
- **AP2 (entregado):** 26 wireframes conectados y 3 tareas. Evaluación heurística: **la llenó el propio usuario** (no hubo profesional externo). **No hubo pruebas con usuarios.**
- **AP3 (entregado):** alta fidelidad, 11 estados, módulo de accesibilidad, eliminación de cuenta, 4 correos y análisis. Informe: https://claude.ai/artifact/HvT7UWB2B5pn1rg9EGGZ6q
- Guion de prueba con usuario: https://claude.ai/artifact/PW6XL7MeJCXTYdc61sMJiF (no consta que se haya hecho).
- **Regla ética:** los resultados de usuarios y expertos **no se inventan**.

### Tareas de evaluación
- **T1 · Buscar ruta al Jockey Plaza y seguir el viaje:** F1_04 → … → F1_10.
- **T2 · Reportar ubicación y estado de una combi:** F1_04 → F2_01 → F2_02 → F2_03 → F2_04 → F2_08.
- **T3 · Configurar una alerta diaria:** F3_01 → F3_02 → F3_03 → F3_04.

### Proyecto Final (enunciado PF 2026) — entrega pendiente, fecha ❓
- **MVP funcional** que demuestre las interacciones principales; «no deberá limitarse al diseño de prototipos en Figma».
- Modalidad elegida: **Interfaces móviles (iPhone)**; también encaja **mapas interactivos** cuando haya mapa real.
- Requisitos: problema, público y propuesta de valor; diseño UX/UI; funcionalidades reales; navegación funcional; **integración de tecnologías, servicios o APIs**; usabilidad, accesibilidad y diseño inclusivo; **evidencia de pruebas de funcionamiento y evaluación básica de usabilidad**.
- Herramientas sugeridas: GitHub, Vercel/Render, **Supabase**, APIs REST.
- **Puntos adicionales:** integración de **IA** y **agentes de IA** con utilidad concreta y funcional.
- Entregables: **MVP ejecutable**, **PPT** (proceso de diseño, arquitectura de información, interfaces), **repositorio o acceso** (GitHub o URL), **demostración en vivo**.
- Se evalúa: experiencia de usuario, diseño de interacción, funcionalidad, principios de IHC e innovación tecnológica, **no solo la apariencia**.

---

## 5. Tecnología y entorno

| Elemento | Decisión |
|---|---|
| App | React Native + **Expo SDK 58** + TypeScript estricto |
| Navegación | **Expo Router**, rutas en **`src/app`** (no existe `/app` en la raíz) |
| Estilos | `StyleSheet` + tokens de `src/theme`; nada de valores sueltos |
| Fuente | Inter (`@expo-google-fonts/inter`), familia por peso (`Inter_600SemiBold`), no `fontWeight` |
| Íconos | `lucide-react-native` + `react-native-svg` (los mismos que la alta fidelidad) |
| Lint | ESLint con la configuración oficial de Expo |
| Almacenamiento local | `@react-native-async-storage/async-storage` (`src/data/preferencias.ts`) |
| Dependencias agregadas | `expo-location`, `expo-image-picker`, `expo-haptics`, `@react-native-community/datetimepicker` |
| Backend (Fase 5, completa) | **Supabase**: PostgreSQL, Auth (OTP por correo), Realtime, Storage (fotos) y pg_cron (borrado programado). Cliente `@supabase/supabase-js` con sesión en AsyncStorage; claves en `.env.local` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). PostGIS disponible pero no se usa por ahora |
| Mapa (Fase 6, en curso) | `react-native-maps` en Expo Go (Apple Maps en iOS, sin API key); ubicación con `expo-location` en primer plano; notificaciones locales con `expo-notifications` (6.3) |
| Notificaciones (futuro) | Expo Notifications (push remoto requiere *development build*) |
| IA (futuro) | Sin decidir; siempre detrás de una Edge Function (la clave nunca va en la app) |

**Entorno:** PC Linux; proyecto en `/home/pc-322/Projects/personal/ruta-clara`; pruebas en **iPhone con Expo Go** (solo soporta el SDK más reciente). MCP de Figma conectado. `CLAUDE.md` y `AGENTS.md` versionados.

**Reglas permanentes para Claude Code:**
- Instalar siempre con `npx expo install`; no instalar librerías nuevas sin preguntar.
- **Leer el frame de alta fidelidad con el MCP de Figma antes de escribir código.**
- Mostrar el plan antes de ejecutar; una tarea a la vez; commit tras cada paso verificado.
- Validar con `npx tsc --noEmit` y `npx expo lint`; `npx expo-doctor` cuando cambian las dependencias.
- Textos en español peruano, como en Figma.
- Las pantallas solo usan `src/data/repositorio.ts`; nunca los mocks.
- Ajustar escenarios de prueba, nunca la lógica, para imitar números de Figma.

## 6. Arquitectura del código

```
src/
├── app/                 # Expo Router
│   ├── (tabs)/          # index (Inicio), favoritos (F3_01), reportar (abre modal), alertas (F3_04), perfil (F2_09)
│   ├── ruta/[id].tsx    # F1_07
│   ├── paradero/[id].tsx # F3_02
│   ├── alerta.tsx       # F3_03 (modal; params paraderoId | id)
│   ├── viaje/           # espera, a-bordo, fin
│   ├── reporte/         # _layout (Stack + ReporteProvider): index, linea, estado, ubicacion, paradero, transito, seguridad, gracias
│   ├── ajustes.tsx      # F3_05 (interruptores en PreferenciasContext.ajustes; Apariencia Sistema/Claro/Oscuro)
│   ├── accesibilidad.tsx # A1/A2 (texto, alto contraste, reducir movimiento, señales sin color)
│   ├── cuenta/          # D1 index (Mi cuenta) · eliminar/: index (D2), alternativa (D3), confirmar (D4), programada (D5, sin gesto atrás)
│   ├── seguridad.tsx    # F3_06 (param opcional paraderoId)
│   ├── onboarding.tsx, buscar.tsx, rutas.tsx
│   └── dev/             # catalogo, datos (solo __DEV__)
├── components/          # Base: Button, Chip, IconButton (tono="destacado" | "seguridad"), Toggle, Tile, ListItem, Header, BottomNav (badge), Mapa, Segmented, Toast (+ ToastProvider)
│                        # Pantallas: BannerUbicacion, BarraProgreso, BotonMantener, CardParadero, CardRuta, GraficoAfluencia,
│                        # ItemNotificacion, OpcionGrande, OpcionRadio, Paginador, PantallaCarga, PinUnidad, PlaceholderScreen,
│                        # TarjetaDato, TarjetaEstadistica · F3: Avatar, FilaAjuste, MenuLateral (F3_07, Modal sobre Inicio) · 4.8: PildoraNivel · 4.9: PantallaCuenta, TarjetaCuenta
│                        # index.ts (barril)
├── context/             # ViajeContext, ReporteContext, NotificacionesContext, PreferenciasContext, TemaContext (useTema, useEstilos)
├── hooks/               # usePermisoUbicacion, useEnviarReporte, useCerrarSesion, useReducirMovimiento
├── data/                # repositorio.ts (única puerta a los datos), preferencias.ts
├── config/              # gamificacion.ts, reportes.ts, simulacion.ts
├── mocks/  theme/ (colors: paletas clara/oscura/alto contraste, shadows: crearSombras, typography: crearTipografia, spacing)  types/  utils/
```

**Principios:**
1. **Repository:** en la Fase 5 el repositorio pasa a Supabase **sin cambiar firmas** (simula red con 300–600 ms).
2. **Mapa provisional** con las mismas props que el mapa real (reemplazado en 6.0 por `react-native-maps`). La capa de controles sobre el mapa usa `pointerEvents="box-none"`.
3. **Modal de reporte con stack propio**: al cerrarlo se vuelve al origen (A bordo, Inicio o F3_02).
4. Lógica con datos reales (Haversine, total de paraderos calculado).

**Funciones del repositorio (implementadas según lo reportado):**
- `getLineas`, `getLinea`, `getParadero`, `getParaderoCercano`, `buscarDestinos`, `buscarRutas` (reconoce Casa, Trabajo, U), `getReportesCercanos`, `getLugaresGuardados`.
- `esFavorita` / `alternarFavorita` (líneas).
- `getUnidadEnCamino` y tramo del viaje.
- `getUsuario`, `getLineasSugeridas`, `buscarLineas`, `crearReporte`.
- `getReportesSeguridad(horas)`, `getHistorialReportes()`.
- **4.3A:** `getParaderosFavoritos`, `esParaderoFavorito`, `alternarParaderoFavorito`, `getResumenParadero(id)`, `getActividadParadero` (renombrado del antiguo `getResumenParadero`), `getAlertas`, `getAlerta`, `getAlertaDeParadero`, `guardarAlerta`, `eliminarAlerta`, `getOpcionesRutaAlerta`.
- **4.3B:** `getFavoritos`, `getNotificaciones`, `marcarNotificacionLeida`, `contarNoLeidas`, `simularAvisoAlerta`.
- **4.5B:** `Mapa` con decoración (manzanas, parque, avenida; desde 6.0 el fondo es Apple/Google Maps) y props opcionales `marcadorParadero="P"` y `estiloUnidad="burbuja"` (solo Inicio); `CardParadero` recibe `proximas` de `getResumenParadero`; `ListItem enTarjeta`.
- **4.7:** `EstadoPantalla` y `EsqueletoRuta`; `sugerirDestino` (Levenshtein ≤ 3); `Linea.suspendida` (La 73, E9); cola `src/data/colaReportes.ts` + `ColaReportesProvider`; modo de prueba `src/data/simulacion.ts` (interruptores en /dev/datos); dependencia `@react-native-community/netinfo`.
- **4.5C:** `OpcionGrande`/`OpcionRadio` como tarjetas con sombra (radio elegido en redSoft + borde red); `BotonMantener` con `shadows.danger`; `PinUnidad` con ícono Radio y prop `pista`; `ItemNotificacion` con caja canvas (seguridad: círculo redSoft con borde red); `ListItem amplio`; `typography.bodyBold`. Íconos de avisos: Bus, Split, TrafficCone, TriangleAlert, Star relleno.
- **4.4:** `getZonasSeguridad(horas, tipo?)` (zona alta ≥ 3 reportes, en `src/config/reportes.ts`). `Usuario` tiene `telefono` y `avatar`. Ajustes en `src/data/preferencias.ts` (`getAjustes`/`setAjustes`); WhatsApp de soporte en `src/config/soporte.ts` (número de ejemplo).
- **4.6:** estilos por tema: `const crearEstilos = ({ colors, shadows, typography }: Tema) => StyleSheet.create({...})` + `useEstilos(crearEstilos)`; `@/theme` ya no exporta `colors`, `shadows` ni `typography` estáticos. Texto sobre amarillo: `colors.onYellow`. `Ajustes` suma `tema`, `altoContraste`, `escalaTexto` (1–2), `reducirMovimiento`, `senalesSinColor`; `cambiarAjuste` es genérico.
- **4.8:** `/accesibilidad`; alturas fijas de controles pasan a `minHeight` (texto al 200 % sin cortes) y botones/títulos admiten 2 líneas; `useReducirMovimiento()` = preferencia de la app ∨ del sistema (splash, Toast, Gracias, MenuLateral).
- **4.9:** tipo `Cuenta`; `getCuenta`, `desactivarCuenta`, `solicitarEliminacion` (devuelve la fecha ISO), `cancelarEliminacion` (eliminación pendiente en memoria); `src/config/cuenta.ts` (`DIAS_GRACIA_ELIMINACION = 30`, `PALABRA_ELIMINAR`, `PASOS_ELIMINACION`); `formatearFechaLarga` («26 de diciembre de 2026»). Correo del usuario de prueba `// supuesto`.
- `src/utils/formato.ts`: `formatoDias` («L–V», «Fin de semana», «L, M, Mi, V»), `formatoHora`.

**Contexts:** `ViajeContext` (linea, paraderoEspera, destino, sentido, estado, avisarParaBajar, finEn…), `ReporteContext` (tipo, lineaId, enUnidad, ocupacion, velocidad, posicion, compartirEnVivo…), `NotificacionesContext` (`noLeidas`, `actualizarNoLeidas()`), `PreferenciasContext` (`onboardingVisto`…), y `ToastProvider` (en `components/Toast.tsx`).

**Datos de prueba:** líneas La 50 (`la-50`, custer, Ate – Surco, S/ 2.50), El Chosicano, Anconero (sin reportes → estimado), La 73, Santa Cruz. Paraderos Puente Nuevo, Los Ángeles, Av. La Molina, Puente Primavera, Jockey Plaza, Angamos, Plaza Norte. Paraderos favoritos iniciales: Puente Nuevo y Angamos. Sin alertas al iniciar. Favoritos y alertas en Supabase desde 5.6 (antes en memoria). Desde 5.1 el **catálogo** sale de Supabase (`supabase/seed.sql`, generado de los mocks); perfil y cuenta salen de `perfiles` desde 5.3 y los reportes de la tabla `reportes` desde 5.4 (en tiempo real desde 5.5); favoritos, lugares, alertas y avisos en sus tablas desde 5.6.

---

## 7. Diseño en Figma — **alta fidelidad = referencia del código**

- **Archivo:** `scCnOTBkUv6axMpU4GiLwc` · https://www.figma.com/design/scCnOTBkUv6axMpU4GiLwc/RutaClara
- **Página de alta fidelidad:** «RutaClara · Alta fidelidad», `69:441` → `?node-id=69-441`
- Página de wireframes (AP2, solo histórico): «RutaClara · Prototipo», `0:1`. **No editar.**
- Enlace a un nodo: `https://www.figma.com/design/scCnOTBkUv6axMpU4GiLwc/RutaClara?node-id=X-Y` (ID `X:Y` → `X-Y`).
- Plan Education (≈200 llamadas MCP al día, compartidas entre chat y Claude Code).

### Pantallas de alta fidelidad (frames de 360 × 740)

| ID | Pantalla | Nodo | | ID | Pantalla | Nodo |
|---|---|---|---|---|---|---|
| F1_01 | Splash / Carga | 69:487 | | F2_06 | Tránsito | 69:1026 |
| F1_02 | Onboarding 1 | 69:498 | | F2_07 | Seguridad | 69:1061 |
| F1_03 | Onboarding 2 | 69:512 | | F2_08 | Confirmación | 69:1094 |
| F1_04 | Inicio | 69:530 | | F2_09 | Historial y logros | 69:1116 |
| F1_05 | Búsqueda | 69:573 | | F3_01 | Favoritos | 69:1156 |
| F1_06 | Resultados | 69:667 | | F3_02 | Detalle de paradero | 69:1185 |
| F1_07 | Detalle de ruta | 69:715 | | F3_03 | Configurar alerta | 69:1213 |
| F1_08 | Monitoreo en vivo | 69:775 | | F3_04 | Centro de notificaciones | 69:1269 |
| F1_09 | A bordo | 69:813 | | F3_05 | Ajustes | 69:1317 |
| F1_10 | Fin del viaje | 69:853 | | F3_06 | Mapa de seguridad | 69:1378 |
| F2_01 | Reporte rápido | 69:891 | | F3_07 | Menú lateral | 69:1428 |
| F2_02 | Línea | 69:918 | | | | |
| F2_03 | Estado del carro | 69:935 | | | | |
| F2_04 | Confirmar ubicación | 69:959 | | | | |
| F2_05 | Espera en paradero | 69:994 | | | | |

### Estados, accesibilidad, cuenta y correos

| ID | Pantalla | Nodo |
|---|---|---|
| E1 | Búsqueda sin resultados | 95:1504 |
| E2 | Cargando rutas (esqueleto) | 95:1544 |
| E3 | Reporte sin conexión | 96:1520 |
| E4 | Favoritos vacío | 103:1539 |
| E5 | Perfil sin historial | 103:1641 |
| E6 | Alertas vacío | 103:1731 |
| E7 | Rutas · error del sistema | 103:1827 |
| E8 | Alerta · error de validación | 105:1683 |
| E9 | Ruta no disponible | 105:1760 |
| E10 | Inicio sin permiso de ubicación | 105:1849 |
| A1 / A2 | Accesibilidad desactivado / activado | 106:1837 / 106:1913 |
| P1 / P2 | Ejemplo alto contraste / texto 200 % | 108:1868 / 108:2016 |
| D1–D5 | Mi cuenta → advertencia → alternativa → confirmación → periodo de gracia | 109:1928, 109:1992, 109:2047, 109:2088, 109:2118 |
| Oscuro | Inicio / Detalle de paradero / Alertas | 93:1350 / 93:1429 / 93:1463 |
| Correos | Bienvenida, Verificación, Eliminación, Resumen del mes | 111:2039, 111:2098, 113:2029, 113:2100 |
| Inicio de sesión (sin frame, `// supuesto`) | `/ingresar`, `/ingresar/codigo`, `/ingresar/nombre` | — (estructura de D4) |

Secciones: Componentes `69:442`, Flujo 1 `69:486`, Flujo 2 `69:890`, Flujo 3 `69:1155`, Logo `69:1476`, Modo oscuro `93:1349`, Estados `95:1503`, Accesibilidad y cuenta `106:1836`, Mailings `111:1999`, Comparación `114:2047`.

### Componentes maestros (sección `69:442`)

| Componente | Nodo | Variantes y propiedades |
|---|---|---|
| Status Bar | 69:443 | Light, Dark (no se implementa: la barra la dibuja el sistema) |
| Button | 69:450 | Type = Primary, Secondary, Tertiary, Danger × State = Default, Pressed, Disabled, Focus. Radio 16 |
| Chip | 69:459 | Default, Selected, Live, Alert; `Con ícono`, `Ícono` (intercambiable). Píldora |
| Toggle | 69:469 | On, Off (pista Off = ControlOff) |
| Tile | 69:474 | Default, Selected, Danger; `Ícono`. Radio 16, ícono en círculo de 40 |
| Icon Button | 73:1005 | 44 × 44, circular, sombra Card; `Ícono` |
| List Item | 73:1007 | Insignia de 40 con `Con ícono` / `Ícono` |
| Header | 73:1014 | Con Icon Button «atrás» |
| Bottom Nav | 73:1022 | Active = Inicio, Favoritos, Reportar, Alertas, Perfil; `Sin leer`. Pestaña activa con píldora amarilla 52 × 30 |
| Íconos (Lucide) | 81:946 | 47 componentes `Icon/<Nombre>` = nombres de `lucide-react-native` |
| Verificación de contraste | 102:1539 | Tabla WCAG 2.2 de 22 combinaciones (todas cumplen) |

### Tokens de alta fidelidad (estilos `RC-HF/*` = tokens del código)

**Colores claros**

| Token | Valor | Token | Valor |
|---|---|---|---|
| ink | #1C1C1C | yellow | #FFE15C |
| inkMuted | #6B6B6B | yellowSoft | #FFF6D1 |
| inkPressed | #3A3A38 | yellowDeep | #E8B400 (punto «en vivo») |
| line | #D9D9D4 | **red** | **#C93B29** (antes #D9412E) |
| surface | #FFFFFF | redSoft | #FDECEA |
| canvas | #F7F6F2 | **redStrong** | **#B33424** (texto/íconos rojos sobre redSoft) |
| map | #ECEAE3 | blue | #2B78D9 |
| block | #E3E0D6 (manzanas) | blueHalo | #2B78D9 al 22 % |
| park | #DCE5D3 | amber | #F2A93B |
| avenue | #F7F1D6 | scrim | #000 al 45 % |
| controlOff | #8E8D87 (Toggle apagado, 3,3:1) | | |

**Oscuro (`RC-HF-Dark/*`, propuesta):** ink #F2F1EC, inkMuted #A3A29C, line #3A3A37, surface #1F1F1D, canvas #141413, map #22221F, yellow #FFE15C, yellowSoft #3A3212, red #FF6B57, redSoft #3D1E1A, blue #5B9BEB, park #1F2A1E, block #2A2A27, avenue #3A3524, controlOff #7A7974, yellowDeep #E8B400, blueHalo #5B9BEB al 22 %, **onYellow #1C1C1C** (el texto sobre amarillo siempre es oscuro). Botón primario invertido (claro con texto oscuro). Sombras negras más fuertes. Sin valor en Figma (`// supuesto` en el código): redStrong = red, inkPressed #D9D8D2, amber igual que en claro, scrim negro al 60 %, redDeep #E0533F.

**Alto contraste (`RC-HF-HC/*`):** ink #000000, inkMuted #333333, line #000000, surface/canvas #FFFFFF, red #A3271A, redStrong #8F1F14, blue #1453A8, yellowDeep #7A5E00, redSoft #FBE3DF, map #EDEDED, park #BFD9B0, block #C9C9C9, avenue #E3D9A8, controlOff #555555. Solo sobre el tema claro. **Mantiene las sombras** (según Figma) y suma un borde negro de 2 en tarjetas, botones flotantes, buscador y FAB.

**Sombras:** card (0 1 2 ink 6 % + 0 8 24 ink 8 %), float (… 12 %), sheet (0 −8 24, 8 %), pin (0 6 16, 18 %), primary (0 8 20, 20 %), danger (0 10 24 red 35 %). **Anillo de foco:** separación blanca de 2 px + azul de 4 px.

**Radios:** existentes sm 6, md 10, lg 14, xl 20, pill 999. En alta fidelidad: botones, tarjetas y tiles **16**; hoja inferior y tarjetas grandes 20–24; insignias 12. **Pendiente decidir en 4.5A** si se agrega un token de 16 o se usa uno existente.

**Tipografía:** sin cambios (Inter; Display 40, H1 22, H2 18, Title 15, Body 14, BodyStrong 14, Caption 12, CaptionStrong 12, Overline 11, Button 15, Tab 11).

### Patrones visuales de la alta fidelidad
- Tarjetas: superficie blanca con sombra card, **sin borde negro grueso**. La ruta recomendada (F1_06): borde yellowDeep de 2 px.
- Mapa: fondo map + manzanas (block), parques (park), avenidas (avenue); paraderos como **marcador «P»** negro de 28 px (no rojo); unidades en vivo como **burbuja amarilla** con círculo ink e ícono `Bus`; usuario como punto azul con halo.
- Inicio: buscador con lupa; chips con ícono (Casa = House, Trabajo = Briefcase, U = GraduationCap, Seguridad = TriangleAlert en redSoft); tarjeta «Cerca de ti» con **próximas unidades** (La 50 · 4 min, Chosicano · 9 min).
- Selección: color + borde + forma (no solo color). En Seguridad la opción elegida va en redSoft con borde red.
- Rojo **solo** para seguridad y urgencia; amarillo para «en vivo»; azul para la ubicación del usuario.

---

## 8. Reglas de UX/UI
- Grid de 8 pt, márgenes de 16 pt, áreas táctiles ≥ 44 pt.
- Estados de carga, vacío y error con acción de salida en toda pantalla que cargue datos (catálogo E1–E10).
- Mensajes de error: qué pasó, por qué, cómo resolverlo y una acción; sin culpar al usuario; texto + ícono, nunca solo color; junto al campo cuando es validación.
- Accesibilidad: `accessibilityRole`, `accessibilityState`, `accessibilityLabel` en IconButton; `accessibilityAction` alternativa para la alerta urgente; respetar el tamaño de texto y la reducción de movimiento del sistema.
- Prevención de errores: confirmar al salir de A bordo; `router.replace` al subir; bloquear retroceso en F2_08; «¿Descartar cambios?» en F3_03; confirmación escribiendo ELIMINAR (D4).
- Toasts para favoritos, alertas guardadas, llegada del carro y puntos ganados.

## 9. Navegación (Expo Router)

| Figma | Ruta | Tipo |
|---|---|---|
| F1_01 | Splash propio (mín. 1,5 s) | — |
| F1_02–F1_03 | `/onboarding` | `Stack.Protected` |
| F1_04 | `(tabs)/index` | Tab |
| F3_01 | `(tabs)/favoritos` | Tab ✅ |
| — | `(tabs)/reportar` | Abre el modal `/reporte` |
| F3_04 | `(tabs)/alertas` | Tab ✅ (badge «sin leer») |
| F2_09 | `(tabs)/perfil` | Tab ✅ |
| F1_05 / F1_06 / F1_07 | `/buscar`, `/rutas`, `/ruta/[id]` | Stack |
| F1_08 / F1_09 / F1_10 | `/viaje/espera`, `/viaje/a-bordo`, `/viaje/fin` | Stack / fullScreenModal |
| F2_01–F2_08 | `/reporte/*` | Modal con stack propio |
| F3_02 | `/paradero/[id]` | Stack ✅ |
| F3_03 | `/alerta` | Modal ✅ |
| F3_05 | `/ajustes` | Stack ✅ |
| F3_06 | `/seguridad` | Stack ✅ |
| F3_07 | `MenuLateral` (componente, ☰ de Inicio) | Modal ✅ |
| A1/A2 | `/accesibilidad` | Stack ✅ |
| D1–D5 | `/cuenta`, `/cuenta/eliminar/*` | Stack ✅ (D5 sin gesto atrás) |

**TODO pendientes en el código (verificado el 26/11/2026):** edición de datos y «Descargar mis datos» en Mi cuenta (Fase 5); pantalla de Ayuda (sin frame); Modo offline del menú (Fase 5); desvío en F2_02 (toast); Fase 6: mapa arrastrable en F2_04, centrar en mí en Inicio y marcador del destino en F1_06 (6.2); trazos por calles reales fuera de la Fase 6.

---

## 10. Decisiones aprobadas

| # | Decisión | Origen |
|---|---|---|
| 1–24 | Ver historial: Expo + TS; SDK 58; rutas en `src/app`; Repository; mapa provisional; `borderWidths`; Haversine; `sentido`; `usePreventRemove` de `expo-router`; constantes de simulación; `Stack.Protected`; modal de reporte con stack propio; `CLAUDE.md` y `AGENTS.md` versionados; etc. | Octubre |
| 25 | `@react-native-community/datetimepicker` (spinner, intervalos de 5 min) para F3_03 | [Claude chat → aprobado] |
| 26 | Paraderos favoritos y alertas en memoria; sin alertas iniciales; Puente Nuevo y Angamos favoritos | [Claude chat → aprobado] |
| 27 | `getResumenParadero` antiguo renombrado a `getActividadParadero` | [Claude Code → aprobado] |
| 28 | «Mi» para miércoles en textos; «M» en los círculos | [Claude Code → aprobado] |
| 29 | IconButton `tono="destacado"` (fondo amarillo) para favoritos, no «live» | [Claude chat → aprobado] |
| 30 | Umbrales 5 / 30 / 15 min en `src/config` | [Claude chat → aprobado] |
| 31 | `pointerEvents="box-none"` en la capa de controles del mapa | [Claude chat → aprobado] |
| 32 | Tokens `notifIcon: 32`, `unreadDot: 8`; radio 6 (no 8) en notificaciones | [Claude chat → aprobado] |
| 33 | Chip «Todas» en Alertas, «Todos» en Favoritos; lugares Casa, Trabajo, U | [Claude Code → aprobado] |
| 34 | Badge de «sin leer» en la tab Alertas | [Claude chat → aprobado] |
| 35 | Logo B (monograma R) | [Usuario] |
| 36 | Alta fidelidad en una página aparte del mismo archivo, con estilos `RC-HF/*` y componentes propios | [Usuario + Claude chat] |
| 37 | **Rojo #D9412E → #C93B29** y nuevo **redStrong #B33424** (contraste WCAG) | [Claude chat → aprobado] |
| 38 | Paradero como marcador «P» negro; rojo reservado para seguridad | [Claude chat → aprobado] |
| 39 | Tarjeta de Inicio con próximas unidades; tarjeta de progreso de rango en F2_08 | [Claude chat → aprobado] |
| 40 | IconButton de 44 px; Toggle apagado con controlOff | [Claude chat → aprobado] |
| 41 | Lucide en Figma y en código (misma familia) | [Claude chat → aprobado] |
| 42 | Modo claro predeterminado; oscuro y alto contraste como opciones (Sistema / Claro / Oscuro) | [Claude chat → aprobado] |
| 43 | Sin portada en Figma; proyecto individual | [Usuario] |
| 44 | Desde noviembre, la **alta fidelidad es la referencia visual del código** | [Usuario] |
| 45 | Login con **código de 6 dígitos por correo** (OTP de Supabase); SMTP propio antes de probar con otras personas | [Usuario, 26/11] |
| 46 | Datos iniciales de Supabase = **los mocks actuales** (mismos ids); líneas reales después | [Usuario, 26/11] |
| 47 | Sesión de Supabase en AsyncStorage (ya instalado), sin `expo-sqlite` ni url-polyfill | [Claude Code → aprobado] |
| 48 | Sin PostGIS por ahora: distancias con Haversine en el cliente | [Claude Code → aprobado] |
| 49 | SQL versionado en `supabase/migrations` + `seed.sql`, ejecutado en el SQL Editor (sin CLI) | [Claude Code → aprobado] |
| 50 | Pantallas de login con componentes existentes (estilo D4), `// supuesto` (Figma no las tiene) | [Usuario, 26/11] |
| 51 | Fase 5 priorizada para entrega en < 3 semanas: 5.0–5.5 para la demo; 5.6–5.7 si hay tiempo | [Usuario, 26/11] |
| 52 | Supabase no deja editar plantillas de correo sin SMTP propio y la de fábrica no trae el código: el SMTP de Gmail se adelanta al inicio del 5.2 | [Claude Code, 26/11 → aprobado] |
| 53 | Catálogo leído una vez de Supabase a arreglos en memoria (`src/data/catalogo.ts`, mismos nombres que los mocks) con copia en AsyncStorage para usarlo sin red; columna `orden` para conservar el orden de los mocks | [Claude Code, 26/11 → aprobado] |
| 54 | El trigger `crear_perfil` copia datos de demo a cada cuenta nueva (paraderos favoritos, lugares y los 4 avisos de Figma) | [Claude Code, 26/11 → aprobado] |
| 55 | Riesgo aceptado: los reportes anónimos guardan `usuario_id` (uuid sin nombre, visible en la tabla y en Realtime); el repositorio lo oculta. Al borrar la cuenta queda en null | [Claude Code, 26/11 → aprobado] |
| 56 | Login: código de 6 dígitos que vence en 10 min (como el correo 111:2098), SMTP de Gmail, plantilla en `supabase/plantillas/codigo.html` sin «Verificar con un toque», pegada en «Magic link or OTP» y en «Confirm sign up» (primer correo de una cuenta nueva). Cerrar sesión = `signOut` + borrar preferencias (vuelve a la bienvenida) | [Claude Code, 26/11 → aprobado] |
| 57 | La primera vez se pregunta «¿Cómo te llamas?» (`/ingresar/nombre`) y se guarda en `perfiles.nombre`. Pantallas de login `// supuesto` con `PantallaCuenta` + `CampoCuenta` (campo de D4, ahora compartido) | [Claude Code, 26/11 → aprobado] |
| 58 | Cuenta nueva en **0 puntos** («Pasajero Junior»). Perfil, Ajustes, menú y Mi cuenta leen `perfiles` + sesión; estadísticas del mes e insignias (`src/config/insignias.ts`) se calculan con los reportes propios. Desactivar/eliminar/cancelar solo por RPC (`004_cuenta.sql`); al entrar se reactiva la cuenta. Sin foto de perfil (ícono) y «Sin celular» hasta que se pueda editar | [Usuario + Claude Code, 26/11] |
| 59 | Reportes: `crearReporte` usa la RPC `crear_reporte` (lee el perfil antes de insertar para no duplicar desde la cola). Lecturas desde la tabla: reportes de las últimas 24 h en memoria del repositorio, reutilizados 15 s (`invalidarReportes()`); sin red se usan los últimos leídos. La foto no se sube hasta 5.7 | [Claude Code, 26/11 → aprobado] |
| 60 | Tiempo real: un solo canal `postgres_changes` (INSERT y UPDATE en `reportes`, `src/data/tiempoReal.ts`) compartido; solo escucha la pantalla visible (`useReportesEnVivo`, con `useFocusEffect`); avisos agrupados en 500 ms; se cierra en segundo plano y al volver avisa una vez. Inicio, Detalle de paradero, Monitoreo y Mapa de seguridad. «Lo están viendo N personas» (F2_08) sigue supuesto (necesitaría Presence) | [Claude Code, 27/11 → aprobado] |
| 61 | Favoritos (líneas y paraderos), lugares y alertas: en memoria por usuario (se cargan una vez por sesión, sin red se usan los últimos), escrituras primero en la base; orden por `creado_en` (`005_orden.sql`). Avisos: siempre desde la tabla `notificaciones`; el conteo de no leídas se pide al entrar a la app. Sin mocks de usuario salvo `ubicacionUsuario` (Fase 6) | [Claude Code, 27/11 → aprobado] |
| 62 | 5.7: borrado de cuentas vencidas con **pg_cron** (`borrar_cuentas_vencidas()`, diario 08:00 UTC) en vez de Edge Function, sin CLI. Fotos de reportes en el bucket público `fotos-reportes/{usuario}/…` (solo se sube a la carpeta propia); la foto es opcional: sin red el reporte va a la cola con ella, con otro error sale sin foto. Plantilla de correo según 111:2098 ya hecha en 5.2 | [Claude Code, 27/11 → aprobado] |
| 63 | Mapa real con `react-native-maps` en Expo Go (Apple Maps en iOS, sin API key); `expo-maps` descartado (development build, iOS 17) | [Claude Code, 27/11 → aprobado] |
| 64 | Se acepta el fondo de Apple/Google Maps (los colores del mapa de Figma no se aplican en Apple Maps); marcadores, chips y zonas con el estilo RutaClara | [Claude Code, 27/11 → aprobado] |
| 65 | «Usar ubicación de prueba» (en /dev/datos) encendido por defecto para la demo | [Claude Code, 27/11 → aprobado] |
| 66 | Recorridos como líneas rectas entre paraderos (sin servicio de rutas por calles) | [Claude Code, 27/11 → aprobado] |
| 67 | Fase 6 solo con notificaciones locales; push remoto y ubicación en segundo plano fuera (development build) | [Claude Code, 27/11 → aprobado] |
| 68 | 6.0: `Mapa` con `MapView` y las mismas props + `interactivo` (por defecto fijo; Inicio, Monitoreo y Mapa de seguridad se mueven). Encuadre por usuario/paraderos/zonas (las unidades no reencuadran). Zonas como `Circle` de 350 m / 220 m (supuesto). Mapa decorativo para el lector de pantalla | [Claude Code, 27/11 → aprobado] |
| 69 | 6.1: ubicación en `src/data/ubicacion.ts` (GPS en primer plano, última conocida ≤ 60 s, memoria de 30 s); sin permiso o sin GPS se usa la de prueba (la app nunca queda sin ubicación; el permiso lo pide el banner de F1_04). «Usar ubicación de prueba» guardado en AsyncStorage, encendido por defecto y sin depender de `__DEV__` | [Claude Code, 27/11 → aprobado] |

## 11. Propuestas descartadas
- Flutter + Firebase; SDK 54; borrar `src/`; `/app` en la raíz; componente Status Bar; forzar mocks para imitar Figma; `npm audit fix --force`; `--no-sandbox`; overlay nativo para F2_01; editar los estilos `RC/*` de los wireframes; radio de 8 para notificaciones.

## 12. Cuestiones pendientes

| Tema | Detalle |
|---|---|
| Proyecto Final | Fecha exacta de entrega (en menos de 3 semanas desde el 26/11); forma de acceso al MVP (EAS Update/QR o web en Vercel); PPT; guion de la demo |
| IA | Elegir la función (reporte por voz/texto libre o agente de viaje) y el proveedor del modelo |
| Fase 5 | Implementada 26–27/11 (decisiones 45–62). Pendiente conocido: el **comprobante por correo** de la eliminación (D5 dice «Te enviamos un comprobante…», Figma 113:2029) necesita Edge Function + proveedor de correo; trabajo futuro. «Lo están viendo N personas» (F2_08) sigue supuesto (Presence) |
| Fase 6 | Decidida el 27/11 (decisiones 63–67; sub-pasos 6.0–6.3 en ROADMAP) |
| Prueba con usuario | Hacerla con la app real (guion en D9) |
| README | Actualizar la sección «Avance» (SDK 58 ya está en `main` y subido: commit `353ee42`) |
| Informe AP3 | 2 comentarios abiertos (AP1 y confirmación de «Cerrar sesión»; esta última ya está implementada en F3_07) |
| Soporte | Reemplazar el número de WhatsApp de ejemplo en `src/config/soporte.ts` |

## 13. Procedimientos conocidos
- **Actualizar el SDK:** rama `actualizar-sdk-XX` → `npx expo install expo@^XX.0.0 --fix` → si hay `ERESOLVE`, `rm -rf node_modules package-lock.json && npm install && npx expo install --fix` → `npx expo-doctor` 20/20 → revisar changelog → probar → merge y push.
- **`chrome-sandbox` en Linux:** `sudo chown root:root <ruta>/chrome-sandbox && sudo chmod 4755 <ruta>/chrome-sandbox`.
- **Permiso de ubicación en Expo Go:** Configuración → Expo Go → Ubicación → «Preguntar la próxima vez».
- **Alerta urgente:** nunca tocar «Llamar» (105 es la central real de la PNP); usar «Ahora no».
