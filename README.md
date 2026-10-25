# RutaClara

App para el transporte público informal de Lima. Los pasajeros reportan en tiempo real dónde vienen las combis, custers y micros, cuánto se espera en el paradero y qué alertas de seguridad hay en la ruta.

Proyecto académico del curso **Interacción Hombre-Máquina** de la Universidad Tecnológica del Perú (UTP), alineado al **ODS 11: Ciudades y comunidades sostenibles**.

> **Estado:** en desarrollo. Los datos son de prueba (mocks); el backend se integra en una fase posterior.

## Funcionalidades

| Flujo                             | Qué permite                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **F1 · Búsqueda y viaje en vivo** | Buscar cómo llegar a un destino, comparar líneas, ver el detalle de una ruta y seguir la unidad en vivo hasta bajar. |
| **F2 · Reporte colaborativo**     | Reportar la ubicación y el estado de una unidad, la espera en un paradero, el tránsito o un problema de seguridad.   |
| **F3 · Favoritos y alertas**      | Guardar paraderos y rutas frecuentes y recibir alertas automáticas cuando la unidad está cerca.                      |

## Tecnologías

- [React Native](https://reactnative.dev/) con [Expo](https://expo.dev/) (SDK 58) y TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) para la navegación por archivos
- Fuente Inter (`@expo-google-fonts/inter`) e íconos `lucide-react-native`
- ESLint para el análisis del código
- **Próximamente:** Supabase (PostgreSQL + PostGIS, Auth, Realtime), mapas reales y notificaciones push

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- Git
- Celular con la app **Expo Go** ([App Store](https://apps.apple.com/app/expo-go/id982107779) / [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)), o un emulador de Android o simulador de iOS

> **Importante:** la versión de Expo Go debe coincidir con el SDK del proyecto (actualmente **SDK 58**). En iPhone solo se puede instalar la última versión de Expo Go, así que, si la App Store la actualiza, hay que actualizar el proyecto (ver [Problemas comunes](#problemas-comunes)).

## Instalación

```bash
git clone <URL-del-repositorio>
cd rutaclara
npm install
npx expo start
```

Escanea el código QR con la cámara (iPhone) o con Expo Go (Android). El celular y la computadora deben estar en la misma red Wi-Fi; si no carga, usa `npx expo start --tunnel`.

## Comandos útiles

| Comando                      | Para qué sirve                                             |
| ---------------------------- | ---------------------------------------------------------- |
| `npx expo start`             | Inicia el servidor de desarrollo                           |
| `npx expo start -c`          | Inicia limpiando la caché (úsalo si algo se comporta raro) |
| `npx expo install <paquete>` | Instala una librería en la versión compatible con el SDK   |
| `npx tsc --noEmit`           | Revisa los tipos de TypeScript                             |
| `npx expo lint`              | Revisa el código con ESLint                                |
| `npx expo-doctor`            | Verifica que las dependencias sean compatibles con el SDK  |

En la terminal del servidor: `a` abre el emulador de Android, `i` el simulador de iOS (solo en Mac) y `w` el navegador.

## Estructura del proyecto

```
src/
├── app/            # Pantallas y rutas (Expo Router)
│   ├── (tabs)/     # Barra inferior: Inicio, Favoritos, Reportar, Alertas, Perfil
│   ├── ruta/       # Detalle de ruta (/ruta/[id])
│   ├── viaje/      # Espera, a bordo y fin del viaje
│   └── dev/        # Pantallas de desarrollo (catálogo de componentes, datos)
├── components/     # Componentes reutilizables (Button, Chip, Tile, Header…)
├── context/        # Estado compartido (viaje activo, toasts)
├── data/           # Repositorio: única puerta de acceso a los datos
├── mocks/          # Datos de prueba
├── theme/          # Tokens de diseño: colores, tipografía, espaciados
├── types/          # Tipos del dominio
└── utils/          # Funciones de formato y cálculo
```

## Arquitectura y convenciones

- **Las pantallas solo obtienen datos desde `src/data/repositorio.ts`**, nunca desde los mocks. Así, al conectar Supabase solo cambia el repositorio y las pantallas siguen igual.
- **Estilos solo con tokens** de `src/theme`: nada de colores ni tamaños escritos a mano.
- **Instalar librerías siempre con `npx expo install`** (no `npm install <paquete>`), para mantener la compatibilidad con el SDK.
- Textos de la interfaz en español peruano.
- `CLAUDE.md` contiene el contexto del proyecto para Claude Code y debe mantenerse actualizado.

## Rutas principales

| Pantalla (Figma)             | Ruta             |
| ---------------------------- | ---------------- |
| F1_04 Inicio                 | `/`              |
| F1_05 Búsqueda de destino    | `/buscar`        |
| F1_06 Resultados de rutas    | `/rutas`         |
| F1_07 Detalle de ruta        | `/ruta/[id]`     |
| F1_08 Monitoreo en vivo      | `/viaje/espera`  |
| F1_09 En tránsito (a bordo)  | `/viaje/a-bordo` |
| F1_10 Finalización del viaje | `/viaje/fin`     |
| F2_01 Panel de reporte       | `/reporte`       |
| F3_01 Favoritos              | `/favoritos`     |
| F3_04 Alertas                | `/alertas`       |
| F2_09 Perfil                 | `/perfil`        |

## Diseño

Los wireframes y el prototipo navegable (26 pantallas en 3 flujos) están en Figma:
[RutaClara — Wireframes](https://www.figma.com/design/scCnOTBkUv6axMpU4GiLwc/RutaClara)

## Avance

- [x] Fase 1: entorno, proyecto Expo y conexión con Figma
- [x] Fase 2: tokens de diseño y componentes base
- [ ] Fase 3: Flujo 1 (búsqueda y viaje en vivo)
- [ ] Fase 4: Flujos 2 y 3 (reportes, favoritos y alertas)
- [ ] Fase 5: backend con Supabase
- [ ] Fase 6: mapa real, ubicación y notificaciones

## Problemas comunes

**"Project is incompatible with this version of Expo Go"**
La versión de Expo Go no coincide con el SDK del proyecto. Actualiza el proyecto al SDK que indica el mensaje (por ejemplo, 59):

```bash
npx expo install expo@^59.0.0 --fix
npx expo-doctor
```

Hazlo en una rama aparte y coordínalo con el equipo, para que todos usen la misma versión.

**"Unable to resolve module…"**
Falta instalar una librería: `npx expo install <paquete>` y luego `npx expo start -c`.

**Error de `chrome-sandbox` al iniciar en Linux**
Afecta solo a React Native DevTools, no a la app. Para solucionarlo, aplica los permisos que indica el mensaje:

```bash
sudo chown root:root "<ruta>/chrome-sandbox"
sudo chmod 4755 "<ruta>/chrome-sandbox"
```

---

Proyecto académico · Universidad Tecnológica del Perú · Interacción Hombre-Máquina
