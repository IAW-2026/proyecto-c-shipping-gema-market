# UniHousing — Shipping App

Aplicación de logística y envíos del **Tipo C (Marketplace)** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/).

**Marca:** UniHousing — marketplace estudiantil para equipar departamentos en Bahía Blanca.

**Responsable:** Emiliano Sensini

## Deploy

[https://proyecto-c-shipping-gema-market.vercel.app](https://proyecto-c-shipping-gema-market.vercel.app)

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Operador logístico (`logistics`) | `logisitcsoperator+clerk_test@unihousing.com` | Operator@4321 |
| Administrador (`admin_logistics`) | `logisitcsadmin+clerk_test@unihousing.com` | AdminL@4321 |

El código de verificacion por mail siempre es: 424242

> Las contraseñas se gestionan a través de Clerk. Para acceder, registrarse con esos emails o usar los que defina el equipo en Clerk Dashboard.

## Descripción

La Shipping App es la interfaz para **operadores logísticos (fleteros)** y **administradores de logística**. Permite:

- **Operadores:** ver envíos disponibles, tomar pedidos, actualizar estados (retiro, tránsito, entrega), historial de entregas y liquidaciones.
- **Administradores:** panel con métricas, gestión de repartidores (alta/baja/suspensión), gestión de tarifas, supervisión de todos los envíos.

### Flujo de estados de un envío

```
waiting_for_courier → pending_pickup → picked_up → in_transit → delivered
```

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Full-stack | Next.js 16 (App Router) |
| Base de datos | PostgreSQL (Supabase) |
| ORM | Prisma |
| Autenticación | Clerk v7 |
| Mapas | Leaflet + OpenRouteService |
| Gráficos | Recharts |
| Estilos | Tailwind CSS 4 |

## API propia

Endpoints expuestos para el ecosistema inter-servicios:

| Endpoint | Consumidor |
|----------|-----------|
| `POST /api/shipping/cotizaciones` | Buyer App |
| `POST /api/shipping/cotizaciones/reservar` | Payments App |
| `POST /api/shipping/cotizaciones/liberar-reserva` | Payments App |
| `POST /api/shipping/envios` | Seller App |
| `GET /api/shipping/envios/:order_id` | Buyer App, Seller App, Control Plane |
| `POST /api/shipping/sellers/verificar-origen` | Seller App |

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar los valores.

---

## Notas técnicas

### Estimación de días de entrega

Siempre sumamos 1 día por procesamiento administrativo. Después, por cada 8 horas de viaje sumamos 1 día de tránsito (máximo 5). Para rutas urbanas esto da unos 2 días; si en el futuro se manejan rutas más largas, la cuenta escala sola.

### Caché

- **Sesión:** el `userId` interno se cachea en memoria con TTL de 30s. El dólar (USD/ARS) se cachea con TTL de 5 min.
- **Queries:** las queries de Prisma se cachean con `'use cache'` y `cacheLife()` con TTLs graduados según volatilidad.
- **Middleware-first Auth:** autenticación y autorización por rol en el middleware antes del renderizado.
- **PPR:** `cacheComponents: true` — shell estático desde edge, contenido dinámico en streaming.

### Bundle

Leaflet y Recharts se cargan bajo demanda con `next/dynamic`.

---

## Arquitectura y Calidad de Software

### Patrones de Diseño

**Feature-based Architecture con capas internas:** El proyecto se organiza por dominio funcional (quote, shipment, admin, notification) en lugar de por tipo técnico. Cada feature encapsula su lógica de negocio, acciones de servidor y acceso a datos, facilitando la evolución independiente de cada módulo.

```
lib/features/
  ├── quote/          # Cotización: cálculo de precio, reserva, liberación
  ├── shipment/       # Envío: creación, transiciones de estado
  ├── admin/          # Administración: gestión de drivers, tarifas, envíos
  └── notification/   # Notificaciones cross-service a Buyer y Seller
```

**Client Adapter Pattern:** Las integraciones con APIs externas (Seller App, Buyer App, OpenRouteService, DolarAPI) están encapsuladas en clientes dedicados bajo `lib/clients/`. Cada cliente expone una interfaz uniforme (`ApiResult<T>`) y soporta modo mock vía headers o variable de entorno, permitiendo desarrollo y testing sin dependencias externas.

**Single Source of Truth (SSOT) para constantes de dominio:** Los estados de envío, labels, variantes visuales y transiciones válidas se definen una sola vez en `lib/constants/shipment.ts` y se consumen en toda la aplicación. Esto elimina inconsistencias entre frontend y backend.

**Server Actions con RBAC integrado:** Las mutaciones del sistema se implementan como Server Actions de Next.js (`"use server"`), con autorización por rol declarativa en la primera línea de cada función (`requireRole([ROLES.LOGISTICS])`).

**Caché en memoria con TTL:** La sesión del usuario y la cotización del dólar se cachean en memoria con TTLs de 30s y 5min respectivamente, reduciendo llamadas redundantes a Clerk y a la API externa dentro del mismo ciclo de request.

### Decisiones de Dominio que Aportan Realismo

- **Cotización en USD con conversión en tiempo real:** Las tarifas se almacenan en USD/km (moneda estable) y se convierten a ARS al momento de cotizar usando la cotización oficial de [DolarAPI](https://dolarapi.com). Esto refleja cómo operan las empresas de logística reales en economías inflacionarias.

- **Peso volumétrico vs peso real:** El precio se calcula sobre el **peso facturable** = `max(peso real, peso volumétrico)`, donde el peso volumétrico se deriva del volumen del paquete (estándar IATA: 1 m³ = 250 kg). Esto es la práctica estándar en la industria logística.

- **Geocoding y routing con APIs reales:** Las direcciones se geocodifican vía Nominatim (OpenStreetMap) y las distancias se calculan con OpenRouteService (matriz de distancias + direcciones). La geometría de la ruta se persiste como GeoJSON para visualización en el tracking público.

- **Validación de cobertura geográfica:** El sistema verifica que tanto el origen como el destino estén dentro de Bahía Blanca, validando el resultado del geocoding contra la cobertura declarada.

- **Tracking code con secuencia atómica:** Los códigos de seguimiento (`BB-000001-2026`) se generan con una secuencia atómica en PostgreSQL (`INSERT ... ON CONFLICT DO UPDATE`), garantizando unicidad incluso bajo concurrencia.

- **Notificaciones cross-service:** Cada transición de estado dispara notificaciones HTTP a la Seller App y/o Buyer App según corresponda, simulando un ecosistema de microservicios real con webhooks.

### Estructura del Proyecto

```
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Route group: sign-in, sign-up
│   ├── (logistics)/            # Route group: panel del operador
│   │   ├── dashboard/          # Métricas operativas diarias
│   │   ├── available/          # Envíos disponibles para tomar
│   │   ├── courier/            # Envíos activos del operador
│   │   ├── history/            # Historial de entregas
│   │   ├── settlements/        # Liquidaciones semanales
│   │   └── shipments/[id]/     # Detalle de envío individual
│   ├── admin/                  # Panel de administración
│   │   ├── dashboard/          # Métricas globales
│   │   ├── drivers/            # Gestión de repartidores
│   │   ├── rates/              # Gestión de tarifas
│   │   └── shipments/          # Supervisión de envíos
│   ├── api/shipping/           # API REST para ecosistema
│   │   ├── cotizaciones/       # Cotizar, reservar, liberar
│   │   ├── envios/             # Crear y consultar envíos
│   │   └── sellers/            # Verificar origen
│   └── track/[code]/           # Tracking público (sin auth)
├── lib/
│   ├── auth/                   # Autenticación y autorización
│   │   ├── api-key.ts          # Validación de API key (SHA-256)
│   │   ├── rbac.ts             # Control de acceso por rol
│   │   ├── user-cache.ts       # Caché de sesión en memoria
│   │   └── get-current-user-id.ts  # Sincronización Clerk ↔ DB
│   ├── clients/                # Adaptadores de APIs externas
│   │   ├── buyer-api/          # Cliente de la Buyer App
│   │   ├── seller-api/         # Cliente de la Seller App
│   │   ├── exchange-rate/      # Cotización USD→ARS
│   │   └── maps/               # Geocoding, distancias, rutas
│   ├── db/
│   │   ├── queries/            # Capa de lectura (con caché)
│   │   │   ├── logistics/      # Queries del operador
│   │   │   ├── admin/          # Queries del administrador
│   │   │   ├── public/         # Queries públicas (tracking)
│   │   │   └── shared.ts       # Selects y mappers compartidos
│   │   └── mutations/          # Capa de escritura
│   ├── features/               # Lógica de negocio por dominio
│   │   ├── quote/              # Servicio de cotización
│   │   ├── shipment/           # Servicio de envíos + actions
│   │   ├── admin/              # Actions de administración
│   │   └── notification/       # Servicio de notificaciones
│   ├── schemas/                # Validación con Zod
│   │   ├── api/                # Schemas de request/response
│   │   └── domain/             # Schemas de entidades de dominio
│   ├── constants/              # SSOT: estados, labels, config
│   ├── types/                  # Tipos TypeScript compartidos
│   └── utils/                  # Utilidades puras
├── components/ui/              # Design system (Button, Card, Table, Badge...)
├── prisma/
│   └── schema.prisma           # Modelo de datos
└── middleware.ts               # Auth + RBAC a nivel de ruta
```

### Funcionalidades Destacadas

- **Sistema de caché multinivel:** Queries de Prisma con `"use cache"` + `cacheLife()` (Next.js 16), caché en memoria para sesión y dólar, y PPR (Partial Pre-Rendering) para shell estático con streaming de contenido dinámico.

- **Streaming SSR con Suspense boundaries:** Cada sección del dashboard se renderiza de forma independiente con su propio skeleton, permitiendo que el contenido llegue al usuario a medida que está listo (streaming HTML).

- **Mapas interactivos con carga diferida:** Leaflet y Recharts se cargan bajo demanda con `next/dynamic`, evitando inflar el bundle JavaScript de páginas que no los necesitan.

- **Liquidaciones con SQL nativo:** Las consultas de liquidaciones semanales usan `$queryRaw` de Prisma con `date_trunc` de PostgreSQL para agrupación eficiente por semana ISO, evitando post-procesamiento en JavaScript.

- **API Playground para desarrollo:** Panel interactivo en `/dev/api-playground` que permite probar todos los endpoints de la API con payloads predefinidos, headers mock y modo debug, facilitando la integración con otros equipos del ecosistema.

- **Transacciones con aislamiento serializable:** La creación de tarifas usa `isolationLevel: "Serializable"` para prevenir condiciones de carrera al validar solapamiento de rangos de peso.

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>
