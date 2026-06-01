# UniHousing — Shipping App

Aplicación de logística y envíos del **Tipo C (Marketplace)** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/).

**Marca:** UniHousing — marketplace estudiantil para equipar departamentos en Bahía Blanca.

**Responsable:** Emiliano Sensini

## Deploy

[https://proyecto-c-shipping-gema-market.vercel.app](https://proyecto-c-shipping-gema-market.vercel.app)

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Operador logístico (`logistics`) | `shipping.user+clerk_test@iaw.com` | iawuser# |
| Administrador (`admin_logistics`) | `shipping.admin+clerk_test@iaw.com` | iawuser# |

El código de verificacion por mail siempre es: 424242


## Descripción

La Shipping App es la interfaz para **operadores logísticos (fleteros)** y **administradores de logística**. Permite:

- **Operadores:** ver envíos disponibles, tomar pedidos, actualizar estados (retiro, tránsito, entrega), historial de entregas y liquidaciones.
- **Administradores:** panel con métricas, gestión de repartidores (alta/baja/suspensión), gestión de tarifas, supervisión de todos los envíos.

### Flujo de estados de un envío

```
waiting_for_courier → pending_pickup → picked_up → in_transit → delivered
```

## Área de Desarrollo (Dev Center)

Les dejo esta sección que hice con el fin de testear el sistema. El Dev Center es un conjunto de herramientas interactivas accesibles desde cualquier navegador sin necesidad de autenticación. Ideal para evaluadores y equipos de integración.

**Acceso:** [`/dev`](https://proyecto-c-shipping-gema-market.vercel.app/dev)

| Ruta | Herramienta | Qué permite |
|------|-------------|-------------|
| `/dev` | **Testing Checklist** | Checklist interactivo con todos los flujos a probar (ciclo de envío, dashboard, gestión de drivers, tracking público, API playground, consola). El progreso se guarda en localStorage. |
| `/dev/seed` | **Seed + DB Explorer** | Botón "Seedear Base de Datos" que crea envíos, tarifas, drivers y usuarios con datos realistas de Bahía Blanca (fechas relativas al momento de ejecución). El explorador permite seleccionar cualquier tabla y ver su contenido. |
| `/dev/playground` | **API Playground** | Simula el flujo completo de integración con las aplicaciones de buyer y seller: configurar origen/destino, cotizar, reservar, crear envío. Muestra el tráfico HTTP entre servicios en un log lateral. |

A pesar de que el usuario de prueba ya tiene pedidos. Les recomiendo encarecidamente que seeden la base de datos, esto va hacer que los pedidos de muestra creados tengan como referencia la fecha actual. 


---

## Arquitectura y Calidad de Software

### Decisiones de Dominio que Aportan Realismo

- **Estimación de días de entrega:** Siempre sumamos 1 día por procesamiento administrativo. Después, por cada 8 horas de viaje sumamos 1 día de tránsito (máximo 5). Para rutas urbanas esto da unos 2 días; si en el futuro se manejan rutas más largas, la cuenta escala sola.

- **Cotización en USD con conversión en tiempo real:** Las tarifas se almacenan en USD/km (moneda estable) y se convierten a ARS al momento de cotizar usando la cotización oficial de [DolarAPI](https://dolarapi.com). Esto refleja cómo operan las empresas de logística reales en economías inflacionarias.

- **Peso volumétrico vs peso real:** El precio se calcula sobre el **peso facturable** = `max(peso real, peso volumétrico)`, donde el peso volumétrico se deriva del volumen del paquete (estándar IATA: 1 m³ = 250 kg). Esto es la práctica estándar en la industria logística.

- **Geocoding y routing con APIs reales:** Las direcciones se geocodifican vía Nominatim (OpenStreetMap) y las distancias se calculan con OpenRouteService (matriz de distancias + direcciones). La geometría de la ruta se persiste como GeoJSON para visualización en el tracking público.

- **Validación de cobertura geográfica:** El sistema verifica que tanto el origen como el destino estén dentro de Bahía Blanca, validando el resultado del geocoding contra la cobertura declarada.

- **Tracking code con secuencia atómica:** Los códigos de seguimiento (`BB-000001-2026`) se generan con una secuencia atómica en PostgreSQL (`INSERT ... ON CONFLICT DO UPDATE`), garantizando unicidad incluso bajo concurrencia.

- **Notificaciones cross-service:** Cada transición de estado dispara notificaciones HTTP a la Seller App y/o Buyer App según corresponda, simulando un ecosistema de microservicios real con webhooks.

### Decisiones que hacen al sistema robusto y mantenible

- El proyecto está organizado por **dominios de negocio** (cotización, envío, administración, notificaciones) en lugar de por capas técnicas. Cada módulo vive en `lib/features/` con su propia lógica, sus acciones de servidor y su acceso a datos, lo que permite trabajar en uno sin romper otro.

- Las **integraciones con APIs externas** (OpenRouteService, DolarAPI, Seller App, Buyer App) están aisladas en `lib/clients/`. Cada una tiene una interfaz uniforme y soporta un modo mock que se activa con un header o una variable de entorno, permitiendo desarrollar y testear sin depender de que esas APIs estén disponibles.

- Los **estados de envío, etiquetas, colores y transiciones válidas** se definen una sola vez en `lib/constants/shipment.ts` y se consumen tanto en frontend como en backend. Es imposible que queden desincronizados.

- Las **lecturas y escrituras a la base de datos** están separadas en directorios distintos (`lib/db/queries/` vs `lib/db/mutations/`). Las queries aprovechan el caché de Next.js con TTLs graduados según la volatilidad de cada dato. Las mutaciones usan transacciones explícitas y, cuando hace falta, aislamiento serializable para evitar condiciones de carrera.

- La **seguridad está en capas**: el middleware de Clerk intercepta todas las rutas y redirige según el rol antes de renderizar cualquier página. Cada Server Action arranca con `requireRole()` como primera línea. Las llamadas entre servicios se autentican con API key validada mediante `crypto.timingSafeEqual`, previniendo ataques de timing.

- Cuando una API externa falla, el sistema **no se cae**: usa valores por defecto sensatos.

- Los **IDs de las entidades** usan un prefijo que las identifica (`usr_`, `shp_`, `qte_`, `trf_`) seguido de un ULID, único, ordenable por tiempo y URL-safe. Los códigos de seguimiento (`BB-000001-2026`) se generan con una secuencia atómica de PostgreSQL que garantiza unicidad incluso bajo concurrencia.

- Las **rutas** se organizan con route groups que separan los dominios: `(auth)`, `(logistics)`, `admin/`, `api/shipping/` y `track/[code]/`. Cada ruta tiene su carpeta `_components/` con los componentes específicos de esa vista. Los componentes genéricos y reutilizables (Button, Card, Table, Badge, etc.) viven en `components/ui/` y se comparten entre todos los módulos, asegurando consistencia visual sin duplicación.

### Estructura del Proyecto

```
├── app/
│   ├── (auth)/               # Sign-in, sign-up
│   ├── (logistics)/           # Panel del operador
│   ├── admin/                 # Panel de administración
│   ├── api/shipping/          # API REST del ecosistema
│   ├── dev/                   # Dev Center
│   ├── track/[code]/          # Tracking público
│   └── unauthorized/          # Página 403
├── lib/
│   ├── auth/                  # Autenticación y autorización
│   ├── clients/               # Adaptadores de APIs externas
│   ├── config/                # Navegación y constantes de config
│   ├── constants/             # SSOT estados, labels
│   ├── db/
│   │   ├── queries/           # Lecturas con caché
│   │   └── mutations/         # Escrituras con transacciones
│   ├── features/              # Lógica de negocio por dominio
│   ├── hooks/                 # Custom hooks
│   ├── schemas/               # Validación Zod
│   ├── types/                 # Tipos compartidos
│   └── utils/                 # Utilidades
├── components/ui/             # Design system
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── middleware.ts
```