[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/mVV06Hfm)
# shipping

Aplicación **Shipping** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `<!-- completar -->`.

Esta app corresponde al módulo de envíos y logística en el proyecto de tipo **C (Marketplace)**.

## Estimación de días de entrega

Siempre sumamos 1 día por procesamiento administrativo. Después, por cada 8 horas de viaje sumamos 1 día de tránsito (máximo 5). Para rutas urbanas esto da unos 2 días; si en el futuro se manejan rutas más largas, la cuenta escala sola.

---

## Rendimiento

### Caché de aplicación

**Sesión:** el `userId` interno se cachea en memoria con TTL de 30s para evitar llamar a `currentUser()` (Clerk API) en cada navegación. El dólar (USD/ARS) se cachea con TTL de 5 min. Ver `lib/services/exchange-rate/`.

### Caché de queries

Las queries de Prisma se cachean con `'use cache'` y `cacheLife()` (Next.js 16) con TTLs graduados según volatilidad:

| Función | TTL |
|---------|-----|
| `getAvailableShipments` | 30s |
| `getDashboardMetrics`, `getActiveShipments`, `getAllShipments` | 1 min |
| `getPerformanceData`, `getSettlements`, `getAdminDashboardMetrics`, `getAllDrivers`, `getAllRates`, `getDriverById` | 5 min |

### Middleware-first Auth

La autenticación y autorización por rol se ejecutan en el middleware de Next.js **antes** del renderizado. Esto permite que layouts y páginas sean estáticos y cacheables. Los data components leen la identidad del usuario desde headers inyectados y resuelven el `userId` interno de Prisma dentro de `<Suspense>` boundaries.

**Redirecciones:** el middleware enruta automáticamente según el rol — `logistics` a `/dashboard`, `admin_logistics` a `/admin/dashboard`, usuarios sin rol a `/unauthorized`.

### Partial Prerendering (PPR)

Habilitamos `cacheComponents: true` en `next.config.ts`. El shell estático (layouts, sidebars, navegación) se sirve instantáneamente desde el edge de Vercel, mientras que el contenido dinámico hace streaming progresivamente dentro de los `Suspense` boundaries.

### Reducción de bundle

- **Leaflet** y **Recharts** se cargan bajo demanda con `next/dynamic` para minimizar Total Blocking Time (TBT) en mobile.

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>
