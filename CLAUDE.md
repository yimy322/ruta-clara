# RutaClara

App colaborativa para el transporte público informal de Lima (combis, custers, micros).
Los pasajeros reportan en tiempo real dónde vienen las unidades, la espera en paraderos y alertas de seguridad.

## Stack
- React Native + Expo (SDK 57) con TypeScript estricto
- Navegación: Expo Router (rutas por carpetas en /app)
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

## Reglas de trabajo
- Textos de la interfaz en español peruano, tal como aparecen en Figma.
- Componentes funcionales con hooks; un componente por archivo en /src/components.
- No instalar librerías nuevas sin preguntar antes.
- Trabajar una pantalla o componente a la vez y explicar brevemente qué cambió.
- Usar datos de prueba en /src/mocks hasta que se conecte Supabase.
