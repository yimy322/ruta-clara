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
- Referencia visual: página "RutaClara · Alta fidelidad" (node 69:441).
  La página "RutaClara · Prototipo" son los wireframes del AP2: no usarla para estilos.
- Estilos de alta fidelidad: RC-HF/Color/*, RC-HF/Type/*, RC-HF/Shadow/* → tokens en /src/theme.
  RC-HF-Dark/* (oscuro) y RC-HF-HC/* (alto contraste) para el tema dinámico.
- Componentes maestros en la sección 69:442; íconos = lucide-react-native (mismos nombres).
- Node-ids de pantallas, estados y componentes: docs/RUTACLARA_CONTEXT.md §7.
- Grid 8 pt, márgenes 16, áreas táctiles mínimas de 44 pt.
- Rojo = seguridad/urgencia · Amarillo = unidad en vivo · Azul = ubicación del usuario.

## Documentación del proyecto
Antes de cada paso, leer docs/ROADMAP.md y docs/RUTACLARA_CONTEXT.md.
Los prompts pendientes están en docs/PROMPTS_PENDIENTES.md.

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
| F3_01 · Favoritos | (tabs)/favoritos.tsx | /favoritos | Tab. Recarga al recibir foco |
| F2_01 · Panel de reporte rápido | reporte/index.tsx | /reporte | Modal (tab "Reportar" lo abre; (tabs)/reportar.tsx es una ruta vacía). reporte/_layout.tsx: Stack sin header + ReporteProvider |
| F2_02 · Ubicación de unidad — Línea | reporte/linea.tsx | /reporte/linea | Paso del modal |
| F2_03 · Estado del carro | reporte/estado.tsx | /reporte/estado | Paso del modal |
| F2_04 · Confirmar ubicación | reporte/ubicacion.tsx | /reporte/ubicacion | Paso del modal |
| F2_05 · Espera en paradero | reporte/paradero.tsx | /reporte/paradero | Paso del modal (provisional) |
| F2_06 · Tránsito / Trancadera | reporte/transito.tsx | /reporte/transito | Paso del modal (provisional) |
| F2_07 · Reporte de seguridad | reporte/seguridad.tsx | /reporte/seguridad | Paso del modal |
| E3 · Reporte sin conexión | reporte/sin-conexion.tsx | /reporte/sin-conexion | Paso del modal, sin gesto atrás. Param `id` del reporte en cola (`useColaReportes()`) |
| F2_08 · Confirmación y agradecimiento | reporte/gracias.tsx | /reporte/gracias | Paso del modal, sin gesto atrás. Recibe `puntos`, `total`, `personas` por params (también se abre desde F1_10) |
| F3_04 · Centro de notificaciones | (tabs)/alertas.tsx | /alertas | Tab. Recarga al recibir foco; el punto rojo de la tab sale de `useNotificaciones()` |
| F2_09 · Historial y logros | (tabs)/perfil.tsx | /perfil | Tab |
| F3_02 · Detalle de paradero | paradero/[id].tsx | /paradero/puente-nuevo | Stack (desde la card de Inicio). Recarga al recibir foco |
| F3_03 · Configurar alerta diaria | alerta.tsx | /alerta | Modal. Params opcionales `paraderoId` (nueva, desde F3_02) o `id` (editar); pide confirmación si hay cambios sin guardar |
| F3_05 · Ajustes | ajustes.tsx | /ajustes | Stack (desde ⚙ en Mi perfil y en Alertas, y desde el menú lateral). Los interruptores van en `ajustes` de `usePreferencias()` |
| A1/A2 · Accesibilidad | accesibilidad.tsx | /accesibilidad | Stack (desde la fila Accesibilidad de Ajustes). Tamaño del texto, alto contraste, reducir movimiento y señales sin depender del color (`ajustes` de `usePreferencias()`) |
| D1 · Mi cuenta | cuenta/index.tsx | /cuenta | Stack (desde la fila de perfil de Ajustes). Recarga al recibir foco; aviso para cancelar una eliminación pendiente |
| D2 · Eliminar cuenta: advertencia | cuenta/eliminar/index.tsx | /cuenta/eliminar | Stack. Paso 1 de 3 (estructura común: `PantallaCuenta`) |
| D3 · Eliminar cuenta: alternativa | cuenta/eliminar/alternativa.tsx | /cuenta/eliminar/alternativa | Stack. Paso 2 de 3; «Desactivar» cierra la sesión |
| D4 · Eliminar cuenta: confirmación | cuenta/eliminar/confirmar.tsx | /cuenta/eliminar/confirmar | Stack. Paso 3 de 3; escribir ELIMINAR; `router.replace` a D5 |
| D5 · Eliminación programada | cuenta/eliminar/programada.tsx | /cuenta/eliminar/programada | Stack sin gesto atrás. «Entendido» cierra sesión; «Cancelar eliminación» vuelve a /cuenta |
| — · Ingresar (correo) | ingresar/index.tsx | /ingresar | Stack sin flecha atrás. Solo sin sesión (`useSesion()`); supuesto, sin frame |
| — · Código de 6 dígitos | ingresar/codigo.tsx | /ingresar/codigo | Stack. Param `correo`; verifica al completar, reenviar a los 60 s |
| — · ¿Cómo te llamas? | ingresar/nombre.tsx | /ingresar/nombre | Stack sin flecha atrás. Solo la primera vez (perfil sin nombre) |
| F3_06 · Mapa de seguridad | seguridad.tsx | /seguridad | Stack (chip Seguridad de Inicio, menú lateral, aviso de seguridad). Param opcional `paraderoId` |
| F3_07 · Menú lateral | components/MenuLateral.tsx | — | No es ruta: Modal sobre Inicio (☰) |
| F1_05 · Búsqueda de destino | buscar.tsx | /buscar | Stack |
| F1_06 · Resultados de rutas | rutas.tsx | /rutas | Stack |
| F1_07 · Detalle de ruta | ruta/[id].tsx | /ruta/la-50 | Stack |
| F1_08 · Monitoreo en vivo | viaje/espera.tsx | /viaje/espera | Stack |
| F1_09 · En tránsito (a bordo) | viaje/a-bordo.tsx | /viaje/a-bordo | Stack |
| F1_10 · Finalización del viaje | viaje/fin.tsx | /viaje/fin | Modal fullScreenModal |
| — Catálogo de componentes (dev) | dev/catalogo.tsx | /dev/catalogo | Stack |
| — Datos de prueba (dev) | dev/datos.tsx | /dev/datos | Stack |

Primer uso: `_layout.tsx` usa `Stack.Protected` con `onboardingVisto` (PreferenciasContext) y `estado` de `useSesion()` (SesionContext: cargando / sin-sesion → /ingresar / sin-nombre → /ingresar/nombre / lista → app). Toda ruta nueva debe declararse dentro del grupo protegido.
Cerrar sesión: `useCerrarSesion()` (/src/hooks) pide confirmación, llama a `cerrarSesion()` de `useSesion()` (Supabase) y vuelve al onboarding. Funciones de Auth en /src/data/sesion.ts.
Confirmar antes de salir: `usePreventRemove(condición, ({ repeat }) => …)`; para dejar salir, poner la condición en false y llamar a `repeat()` (SDK 58; no usar `navigation.dispatch(data.action)`).
Cerrar el modal de reporte desde cualquier paso: `cerrar()` de `useReporte()` (`router.dismissAll()` solo vuelve al primer paso del stack anidado).
Camino feliz: Inicio → buscar → rutas → ruta/la-50 → viaje/espera → viaje/a-bordo → viaje/fin → Inicio.
SafeAreaView en todas las pantallas: Header ya cubre el borde superior y BottomNav el inferior, así que se usan `edges` (tabs: left/right; stack y modales: left/right/bottom).
Si `tsc` marca rutas nuevas como inválidas, arrancar `npx expo start` una vez para regenerar `.expo/types/router.d.ts`.

## Datos
- Tipos del dominio en /src/types (Linea, Paradero, Reporte, OpcionRuta…).
- Datos de prueba en /src/mocks (sacados del prototipo de Figma; lo que no está en Figma va marcado `// supuesto`).
- Acceso a datos solo por /src/data/repositorio.ts: funciones async con retraso simulado de 300–600 ms. En la Fase 5 se reemplaza por Supabase sin cambiar las firmas.
- Supabase (Fase 5): solo /src/data/supabase.ts importa supabase-js. El catálogo (líneas, paraderos, destinos, vías, búsquedas, rutas por destino) sale de /src/data/catalogo.ts (se carga una vez, con copia sin red). SQL en /supabase (migrations/ en orden + seed.sql generado desde los mocks; se ejecuta en el SQL Editor). Usuario y cuenta (`getUsuario`, `getCuenta`…) leen la tabla `perfiles` de la sesión actual; las columnas protegidas se cambian solo por RPC. Favoritos, lugares y alertas: memoria por usuario en el repositorio con escritura primero en la base; avisos siempre desde la tabla. Fotos de reportes: `subirFotoReporte()` (Storage, bucket `fotos-reportes`).
- **Regla: las pantallas y componentes importan de `@/data/repositorio`, nunca de `@/mocks`.** Única excepción: `dev/catalogo.tsx` con `mocks/catalog.ts`. Los mocks del catálogo y de reportes son la fuente de `supabase/seed.sql` (si cambian, se regenera).
- Tiempo real: las pantallas que muestran reportes usan `useReportesEnVivo()` (/src/hooks): devuelve una `version` para las dependencias del efecto de carga o recibe el callback `cargar`.
- Avisos sin leer: `NotificacionesContext` (`noLeidas`, `actualizarNoLeidas()`); llamar a `actualizarNoLeidas()` después de leer o crear notificaciones.
- Preferencias locales del dispositivo (AsyncStorage) en /src/data/preferencias.ts, separadas del repositorio; las pantallas las usan vía `usePreferencias()`.
- Permiso de ubicación: hook `usePermisoUbicacion` en /src/hooks (se revisa al volver a primer plano). Ubicación (6.1): `getUbicacionUsuario()` usa /src/data/ubicacion.ts (GPS o la de prueba de los mocks; interruptor «Usar ubicación de prueba» en /dev/datos, encendido por defecto).
- Formato de textos (pasaje, "hace X min", ETA) en /src/utils/formato.ts.
- Estados vacíos y de error (E1–E10): componente `EstadoPantalla`. Sin conexión, los reportes van a la cola de /src/data/colaReportes.ts (AsyncStorage) y `ColaReportesProvider` los reenvía al volver la red (NetInfo).
- Tema dinámico (4.6): colores, sombras y tipografía salen de `useTema()` (/src/context/TemaContext.tsx); los estilos se escriben como `const crearEstilos = ({ colors }: Tema) => StyleSheet.create({...})` y se usan con `useEstilos(crearEstilos)`. Texto sobre amarillo: `colors.onYellow`. `spacing`, `radii`, `sizes`, `opacity` y `fonts` se importan directo de `@/theme`.
- Mapa (6.0): `components/Mapa.tsx` usa `react-native-maps` (Apple Maps en iOS, Expo Go sin API key); prop `interactivo` solo en mapas de pantalla completa (por defecto fijo para no competir con el scroll).
- Animaciones: respetar `useReducirMovimiento()` (/src/hooks). Señales sin depender del color: `ajustes.senalesSinColor`.
- Modo de prueba solo en desarrollo: /src/data/simulacion.ts (`forzarError`, `forzarVacio`, `forzarSinRed`), con interruptores en /dev/datos.

## Reglas de trabajo
- Textos de la interfaz en español peruano, tal como aparecen en Figma.
- Componentes funcionales con hooks; un componente por archivo en /src/components.
- No instalar librerías nuevas sin preguntar antes; instalar siempre con `npx expo install`. Aprobado como herramienta de desarrollo: ESLint (eslint + eslint-config-expo, config en eslint.config.js).
- Fuente Inter por familia según el peso (`Inter_600SemiBold`…); no usar `fontWeight`.
- Leer el frame de alta fidelidad con el MCP de Figma antes de escribir código de una pantalla o componente.
- Mostrar el plan antes de ejecutar; trabajar una pantalla o componente a la vez y explicar brevemente qué cambió.
- Validar con `npx tsc --noEmit` y `npx expo lint` (y `npx expo-doctor` si cambian las dependencias); commit tras cada paso verificado.
- Usar datos de prueba de /src/mocks (a través de `@/data/repositorio`) hasta que se conecte Supabase. Para imitar números de Figma se ajustan los escenarios de prueba, nunca la lógica.
- Alerta urgente de seguridad: en pruebas nunca tocar «Llamar» (105 es la central real de la PNP); usar «Ahora no».
