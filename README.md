# UniHousing — Shipping App

Aplicación de logística y envíos del **Tipo C (Marketplace)** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/).

**Marca:** UniHousing — marketplace estudiantil para equipar departamentos en Bahía Blanca.

**Responsable:** Emiliano Sensini

## Deploy

[https://proyecto-c-shipping-gema-market.vercel.app](https://proyecto-c-shipping-gema-market.vercel.app)

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Operador logístico (`logistics`) | `logistics@unihousing.com` | — |
| Administrador (`admin_logistics`) | `admin@unihousing.com` | — |

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

Enunciado completo: <https://iaw-2026.github.io/proyecto/>
