# Plan de ejecución — Etapa 3 · Shipping App (`proyecto-c-shipping-gema-market`)

> **Orden de ejecución:** 2 de 6 (antes de Control Plane 05 y Analytics 06).
> **Disputas: fuera de alcance.** **Marca:** UniHousing. **Auth de integración:** API-key (`x-api-key-hash`).

## Objetivo

Exponer como **API admin** los envíos, couriers y métricas que hoy solo viven en la **UI admin**
(`app/admin/*`), para el **Control Plane** (lectura + reasignar courier / cancelar / banear) y el
**Analytics** (stats). Las queries/mutations admin **ya existen** para la UI
(`lib/db/queries/admin/shipments.ts`, `lib/db/mutations/admin/shipments.ts`) → se reutilizan.

## Contexto del código (lo que ya existe y se reutiliza)

- **Auth service-to-service:** `lib/auth/api-key.ts → validateApiKey(request)` valida
  `x-api-key-hash` = `SHA-256(INTERNAL_API_KEY)` hex **mayúsculas** (`timingSafeEqual`). Patrón ya usado en
  `app/api/shipping/envios/[order_id]/route.ts`.
- **Logging:** `lib/utils/api-logger.ts → logIncomingResponse(endpoint, status, body, ms)` (usar en cada handler).
- **Validación:** Zod (schemas en `lib/.../schemas`). Usar `schema.safeParse(...)`.
- **Queries/mutations admin existentes:** `lib/db/queries/admin/shipments.ts`,
  `lib/db/mutations/admin/shipments.ts`. Para drivers, agregar `lib/db/queries/admin/drivers.ts` y
  `lib/db/mutations/admin/drivers.ts` (mismo patrón).
- **Modelos** (`prisma/schema.prisma`):
  - `Shipment`: `id (shp_)`, `order_id @unique`, `quote_id`, `buyer_id`, `seller_id`, `logistics_id?`
    (FK → `User`), `receiver_name`, `receiver_phone`, `tracking_code @unique`, **`status String`**
    (`waiting_for_courier|pending_pickup|picked_up|in_transit|delivered`), `price Decimal`,
    `picked_up_at?`, `delivered_at?`, `created_at`, geocampos (`*_lat/lng`, `route_*`).
  - `User`: `id (usr_)`, `clerk_user_id`, `email`, `full_name`, `role (default "logistics")`,
    **`banned Boolean`**, `created_at`, relación `shipments[]`.

> **Vocabulario de estados — mapping obligatorio.** El enum interno NO tiene `failed`/`cancelled`, pero
> `apis.md` (y Control Plane) los usan. Definir y documentar el mapping en `lib/.../status.ts`:
> internos `{waiting_for_courier, pending_pickup, picked_up, in_transit, delivered}` + estados de gestión
> `{failed, cancelled}`. Como `status` es `String`, agregar `failed`/`cancelled` como valores válidos en
> la máquina de estados existente (constantes en `lib/features/shipment/*`), no en un enum de Prisma.

## Convenciones (todas las rutas nuevas)

1. `if (!validateApiKey(request)) return 401 { error: "Unauthorized" }` (+ `logIncomingResponse`).
2. Listados → `{ items, page, page_size, total, sort_by, order }`. `page_size` máx 100.
3. snake_case · `Decimal → Number` · fechas ISO (`?.toISOString() ?? null`).
4. Carpeta: `app/api/shipping/admin/...`.

---

## Endpoints a implementar

### 1) `GET /api/shipping/admin/envios` — listado de envíos

**Archivo:** `app/api/shipping/admin/envios/route.ts` · **Consumido por:** Control Plane, Analytics.
Reutiliza `lib/db/queries/admin/shipments.ts` (la query de la UI admin de shipments) con paginación/orden.
```ts
// query
logistics_id?, status? (uno de los 7 incl. failed/cancelled), date_from?, date_to?,
sort_by ∈ {created_at, price, status} = created_at, order ∈ {asc,desc} = desc, page=1, page_size=20
```
**200 (item):**
```json
{ "shipping_id": "shp_…", "order_id": "ord_…", "buyer_id": "usr_…", "seller_id": "usr_…",
  "logistics_id": "usr_…", "status": "delivered", "tracking_code": "BB-0001-2026",
  "price": 3500.0, "picked_up_at": "2026-04-17T14:00:00Z", "delivered_at": "2026-04-17T16:30:00Z",
  "created_at": "2026-04-17T13:00:00Z" }
```

### 2) `GET /api/shipping/admin/envios/:shipping_id` — detalle admin

**Archivo:** `app/api/shipping/admin/envios/[shipping_id]/route.ts`. Detalle completo (direcciones,
`receiver_*`, geocampos, `quote_id`). 404 si no existe.
> Nota: ya existe `GET /api/shipping/envios/:order_id` (por **order_id**, público inter-app). Este nuevo es
> por **shipping_id** y admin — no se pisan.

### 3) `PATCH /api/shipping/admin/envios/:shipping_id` — reasignar / cancelar

**Mismo archivo** que (2). **Consumido por:** Control Plane. Reutiliza/crea en
`lib/db/mutations/admin/shipments.ts`.
```ts
const BodySchema = z.object({
  logistics_id: z.string().optional(),                 // reasignar courier (debe existir y no estar banned)
  status: z.enum(['cancelled']).optional(),            // solo cancelación manual desde Control Plane
}).refine(b => b.logistics_id || b.status, 'Nada para actualizar');
```
**200:** `{ "shipping_id": "shp_…", "status": "cancelled", "logistics_id": "usr_…" }`
**Validaciones:** 404 si el envío no existe · 422 si `logistics_id` no existe / está `banned` · respetar la
máquina de estados (no cancelar un `delivered`). Documentar transiciones permitidas.

### 4) `GET /api/shipping/admin/drivers` + `PATCH /api/shipping/admin/drivers/:user_id`

**Archivos:** `app/api/shipping/admin/drivers/route.ts` y `.../[user_id]/route.ts`. Couriers = `User` con
`role = "logistics"`.
- **GET** query: `q` (full_name/email), `banned (true|false)`, `page`, `page_size`, `sort_by
  (created_at|full_name)`, `order`.
  ```json
  { "items": [{ "user_id": "usr_…", "full_name": "Pedro Ruiz", "email": "p@r.com",
    "banned": false, "active_shipments": 3, "created_at": "…" }], "page": 1, "page_size": 20, "total": 12,
    "sort_by": "created_at", "order": "desc" }
  ```
  `active_shipments` = `count(Shipment where logistics_id = user.id AND status NOT IN (delivered,cancelled))`.
- **PATCH** body `{ "banned": boolean }` → `setDriverBanned(userId, banned)`.
  **200:** `{ "user_id": "usr_…", "banned": true }` · 404 si no existe.

### 5) `GET /api/shipping/admin/stats` — métricas agregadas

**Archivo:** `app/api/shipping/admin/stats/route.ts` · **Consumido por:** Analytics. Query `date_from`,
`date_to` (ISO). Crear `getShippingAdminStats({ dateFrom?, dateTo? })` en `lib/db/queries/admin/stats.ts`.
```json
{
  "total_shipments": 189,
  "shipments_by_status": { "waiting_for_courier": 4, "pending_pickup": 12, "picked_up": 6,
                           "in_transit": 8, "delivered": 155, "failed": 5, "cancelled": 9 },
  "average_delivery_hours": 4.2,
  "failure_rate": 0.074
}
```
- `average_delivery_hours`: promedio de `(delivered_at - picked_up_at)` en horas, **solo** sobre
  `status = delivered` con ambos timestamps. Documentar el denominador.
- `failure_rate` = `(failed + cancelled) / total_shipments` (0 si total 0).

### 6) `GET /api/shipping/admin/usuarios` — caché local de Clerk

**Archivo:** `app/api/shipping/admin/usuarios/route.ts`. Lista `User` (couriers/admin logistics).
```json
{ "items": [{ "user_id": "usr_…", "clerk_user_id": "user_…", "email": "p@r.com",
  "full_name": "Pedro Ruiz", "role": "logistics", "banned": false, "created_at": "…" }],
  "page": 1, "page_size": 20, "total": 12 }
```

### 7) (Opcional) `GET /api/shipping/admin/stats/timeseries`

Para curvas de tendencia en Analytics. Query: `date_from`, `date_to`, `granularity (day|week|month)`,
`metric (shipments|delivered)`. **200:** `{ granularity, series: [{ bucket: "2026-06-01", value: n }] }`.
Implementar con `date_trunc` (raw SQL) sobre `created_at`/`delivered_at`. Si no se hace, Analytics deriva la
tendencia paginando `/admin/envios`.

---

## Cambios fuera de los endpoints

- **`status.ts` / máquina de estados:** agregar `failed`/`cancelled` como estados válidos + mapping
  documentado (sección de contexto). El webhook a Buyer/Seller (`.../estado-envio`) debe poder propagar
  `failed`/`cancelled`.
- **`docs/apis.md` (repo Shipping):** sección "Shipping App — Admin" con los 6–7 endpoints + nota auth.
- **`.env.example`:** `INTERNAL_API_KEY` ya está; confirmar.
- **Middleware:** las rutas `/api(.*)` ya son públicas a nivel Clerk en `middleware.ts` (auth real = API-key
  en el handler). No tocar el RBAC de la UI (`lib/auth/rbac.ts`).

## Tests

No hay suite automatizada (solo `scripts/api-tests.sh`). **Recomendado:** agregar checks al script para cada
`/admin/*` (401 sin key, 200 con paginación, PATCH cancelar/banear) y, si el tiempo lo permite, introducir
Vitest mínimo para `getShippingAdminStats`. Como mínimo, dejar ejemplos `curl` documentados.

## Checklist de ejecución

- [ ] Estados `failed`/`cancelled` + mapping documentado.
- [ ] `lib/db/queries/admin/{shipments,drivers,stats}.ts` y `lib/db/mutations/admin/{shipments,drivers}.ts`.
- [ ] Rutas: `envios`, `envios/[shipping_id]` (GET+PATCH), `drivers`, `drivers/[user_id]` (PATCH),
      `stats`, `usuarios` (+ `stats/timeseries` opcional).
- [ ] `logIncomingResponse` en todos los handlers.
- [ ] `docs/apis.md` + repo de docs actualizado (branch + PR + merge).
- [ ] Deploy Vercel con `INTERNAL_API_KEY`.
