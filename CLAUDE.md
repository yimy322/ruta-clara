# RutaClara

App colaborativa para el transporte público informal de Lima (combis, custers, micros).
Los pasajeros reportan en tiempo real dónde vienen las unidades, la espera en paraderos y alertas de seguridad.

## Stack
- React Native + Expo (SDK 58) con TypeScript estricto
- Navegación: Expo Router (rutas en /src/app; no existe /app en la raíz)
- Estilos: StyleSheet de React Native + tokens en /src/theme (nada de colores o tamaños sueltos)
- Backend (fase posterior): Supabase (PostgreSQL + PostGIS, Auth, Realtime)

## Diseño
- Figma: https://www.figma.com/design/scCnOTBkUv6axMpU4GiLwc/RutaClara
- Son wireframes de baja-media fidelidad: respetar estructura, jerarquía y navegación; los estilos se ajustarán después.
- Estilos de Figma: RC/Color/* y RC/Type/* → replicarlos como tokens en /src/theme.
- Componentes base en Figma: Status Bar, Button, Chip, Icon Button, Toggle, Tile, List Item, Header, Bottom Nav.
- Grid 8 pt, márgenes 16, áreas táctiles mínimas de 44 pt.
- Rojo = seguridad/urgencia · Amarillo = unidad en vivo · Azul = ubicación del usuario.

## Pantallas (ID de Figma → flujo)
- F1_01–F1_10: búsqueda de rutas y viaje en vivo
- F2_01–F2_09: reporte colaborativo
- F3_01–F3_07: favoritos, notificaciones y alertas
- Barra inferior: Inicio (F1_04), Favoritos (F3_01), Reportar (F2_01), Alertas (F3_04), Perfil (F2_09)

## Rutas (Expo Router, en /src/app)
Stack raíz sin header nativo (cada pantalla usa nuestro Header). Las tabs usan BottomNav como tabBar.

| Figma | Archivo | URL | Tipo |
|---|---|---|---|
| F1_01 · Splash / Carga | components/PantallaCarga.tsx | — | No es ruta: la muestra _layout mientras cargan fuentes y preferencias (mín. 1,5 s) |
| F1_02–F1_03 · Onboarding | onboarding.tsx | /onboarding | Stack, solo accesible si no se vio el onboarding |
| F1_04 · Inicio — Principal | (tabs)/index.tsx | / | Tab |
| F3_01 · Favoritos | (tabs)/favoritos.tsx | /favoritos | Tab |
| F2_01 · Panel de reporte rápido | reporte/index.tsx | /reporte | Modal (tab "Reportar" lo abre; (tabs)/reportar.tsx es una ruta vacía). reporte/_layout.tsx: Stack sin header + ReporteProvider |
| F2_02 · Ubicación de unidad — Línea | reporte/linea.tsx | /reporte/linea | Paso del modal |
| F2_03 · Estado del carro | reporte/estado.tsx | /reporte/estado | Paso del modal |
| F2_04 · Confirmar ubicación | reporte/ubicacion.tsx | /reporte/ubicacion | Paso del modal |
| F2_05 · Espera en paradero | reporte/paradero.tsx | /reporte/paradero | Paso del modal (provisional) |
| F2_06 · Tránsito / Trancadera | reporte/transito.tsx | /reporte/transito | Paso del modal (provisional) |
| F2_07 · Reporte de seguridad | reporte/seguridad.tsx | /reporte/seguridad | Paso del modal (provisional) |
| F2_08 · Confirmación y agradecimiento | reporte/gracias.tsx | /reporte/gracias | Paso del modal, sin gesto atrás. Recibe `puntos`, `total`, `personas` por params (también se abre desde F1_10) |
| F3_04 · Centro de notificaciones | (tabs)/alertas.tsx | /alertas | Tab |
| F2_09 · Historial y logros | (tabs)/perfil.tsx | /perfil | Tab |
| F1_05 · Búsqueda de destino | buscar.tsx | /buscar | Stack |
| F1_06 · Resultados de rutas | rutas.tsx | /rutas | Stack |
| F1_07 · Detalle de ruta | ruta/[id].tsx | /ruta/la-50 | Stack |
| F1_08 · Monitoreo en vivo | viaje/espera.tsx | /viaje/espera | Stack |
| F1_09 · En tránsito (a bordo) | viaje/a-bordo.tsx | /viaje/a-bordo | Stack |
| F1_10 · Finalización del viaje | viaje/fin.tsx | /viaje/fin | Modal fullScreenModal |
| — Catálogo de componentes (dev) | dev/catalogo.tsx | /dev/catalogo | Stack |
| — Datos de prueba (dev) | dev/datos.tsx | /dev/datos | Stack |

Primer uso: `_layout.tsx` usa `Stack.Protected` con `onboardingVisto` (PreferenciasContext). Toda ruta nueva debe declararse dentro del grupo protegido.
Cerrar el modal de reporte desde cualquier paso: `cerrar()` de `useReporte()` (`router.dismissAll()` solo vuelve al primer paso del stack anidado).
Camino feliz: Inicio → buscar → rutas → ruta/la-50 → viaje/espera → viaje/a-bordo → viaje/fin → Inicio.
SafeAreaView en todas las pantallas: Header ya cubre el borde superior y BottomNav el inferior, así que se usan `edges` (tabs: left/right; stack y modales: left/right/bottom).
Si `tsc` marca rutas nuevas como inválidas, arrancar `npx expo start` una vez para regenerar `.expo/types/router.d.ts`.

## Datos
- Tipos del dominio en /src/types (Linea, Paradero, Reporte, OpcionRuta…).
- Datos de prueba en /src/mocks (sacados del prototipo de Figma; lo que no está en Figma va marcado `// supuesto`).
- Acceso a datos solo por /src/data/repositorio.ts: funciones async con retraso simulado de 300–600 ms. En la Fase 5 se reemplaza por Supabase sin cambiar las firmas.
- **Regla: las pantallas y componentes importan de `@/data/repositorio`, nunca de `@/mocks`.** Única excepción: `dev/catalogo.tsx` con `mocks/catalog.ts`.
- Preferencias locales del dispositivo (AsyncStorage) en /src/data/preferencias.ts, separadas del repositorio; las pantallas las usan vía `usePreferencias()`.
- Permiso de ubicación: hook `usePermisoUbicacion` en /src/hooks (se revisa al volver a primer plano).
- Formato de textos (pasaje, "hace X min", ETA) en /src/utils/formato.ts.

## Reglas de trabajo
- Textos de la interfaz en español peruano, tal como aparecen en Figma.
- Componentes funcionales con hooks; un componente por archivo en /src/components.
- No instalar librerías nuevas sin preguntar antes. Aprobado como herramienta de desarrollo: ESLint (eslint + eslint-config-expo, config en eslint.config.js).
- Trabajar una pantalla o componente a la vez y explicar brevemente qué cambió.
- Usar datos de prueba en /src/mocks hasta que se conecte Supabase.
