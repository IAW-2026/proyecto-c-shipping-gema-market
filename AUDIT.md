# Auditoría Arquitectónica — Violaciones Críticas

**Proyecto:** UniHousing Shipping App (C-Shipping Gema Market)  
**Stack:** Next.js 16 (App Router) + Prisma 7 + PostgreSQL (Supabase) + Clerk v7 + Tailwind CSS 4  
**Fecha:** 29 de mayo de 2026  

---

## Correcciones desde la auditoría anterior

Los siguientes hallazgos críticos del audit previo (27/05/2026) **ya fueron corregidos**:

| Hallazgo anterior | Estado actual |
|---|---|
| `shipment.service.ts` sin transacción DB | **Corregido** — usa `prisma.$transaction()` para `createShipmentRecord` + `confirmQuote` |
| `deleteDriverAction` sin transacción | **Corregido** — `deleteDriver()` usa `prisma.$transaction()` con `updateMany` + `delete` |
| Tracking code con `Math.random()` sin unicidad | **Corregido** — secuencia atómica vía `TrackingSequence` con `INSERT ... ON CONFLICT DO UPDATE` |
| `summarySelect` / `toShipmentSummary` duplicados | **Corregido** — extraídos a `lib/db/queries/shared.ts` |
| Lógica de transición en componente UI | **Corregido** — `COURIER_ACTION_MAP` en `lib/constants/shipment.ts` |
| Queries de dashboard mezcladas | **Corregido** — separadas en `queries/logistics/dashboard.ts` y `queries/admin/dashboard.ts` |

---

## Violaciones graves vigentes

### 1. [SECURITY] Fail-open en validación de API Key *(CORREGIDO)*

**Ubicación:** `lib/auth/api-key.ts:7-9` → `lib/auth/api-key.ts:7-25`  
**Principio:** Seguridad / Fail-safe defaults  

**Estado:** ✅ Corregido el 29/05/2026. Se implementó: validación de que `INTERNAL_API_KEY` exista antes de comparar, uso de `crypto.timingSafeEqual`, hash cacheado como constante de módulo y `try/catch` ante entradas inesperadas.

---

### 2. [SECURITY] BYPASS_RBAC sin guard de entorno *(CORREGIDO)*

**Ubicación:** `lib/auth/rbac.ts:11-26` → `lib/auth/rbac.ts:11-31`  
**Principio:** Seguridad / Defense in depth  

**Estado:** ✅ Corregido el 29/05/2026. Se agregó guard `process.env.NODE_ENV !== "production"` y `console.warn` prominente en amarillo cuando el bypass está activo.

---

### 3. [SOLID/SRP] Prisma directo en Route Handlers de API *(CORREGIDO)*

**Ubicación:**  
- `app/api/shipping/envios/[order_id]/route.ts:16-28` → usa `getShipmentByOrderId()`  
- `app/api/shipping/shipments/[shipmentId]/route/route.ts:26-39` → usa `getShipmentRouteData()`  

**Principio:** Single Responsibility / Separation of concerns  

**Estado:** ✅ Corregido el 29/05/2026. Se extrajeron las consultas a `lib/db/queries/public/shipment-by-order.ts` y `lib/db/queries/public/shipment-route.ts` con `"use cache"` + `cacheLife()`. Los route handlers ahora solo formatean la respuesta.

---

### 4. [DRY] Error handling boilerplate duplicado en 7 API routes

**Ubicación:** Todos los archivos `route.ts` bajo `app/api/shipping/`  
**Principio:** Don't Repeat Yourself  

**Impacto:** El mismo patrón `try/catch` con chequeo de `err.statusCode` se repite idénticamente en 7 route handlers:

```typescript
catch (error) {
  const err = error as Error & { statusCode?: number; code?: string };
  console.error("[TAG] Error:", err.message);
  if (err.statusCode) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode });
  }
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}
```

Son ~12 líneas × 7 routes = ~84 líneas de código duplicado. Un cambio en la política de errores requiere editar 7 archivos.

**Refactor sugerido:** Crear un wrapper de alto orden:

```typescript
// lib/utils/api-handler.ts
export function withApiHandler(
  tag: string,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try { return await handler(req); }
    catch (error) { /* manejo centralizado */ }
  };
}
```

---

### 5. [DRY] API Clients (Buyer/Seller) con estructura idéntica

**Ubicación:**  
- `lib/clients/buyer-api/buyer-api.client.ts`  
- `lib/clients/seller-api/seller-api.client.ts`  

**Principio:** Don't Repeat Yourself  

**Impacto:** Ambos clientes replican el mismo patrón: verificación de headers mock → verificación de `MOCK_EXTERNAL_APIS` → fetch real con `x-api-key-hash` → manejo de errores. La lógica de mock, fetch y error handling es idéntica. Los tipos `BuyerStatusUpdate` y `SellerStatusUpdate` comparten `shipping_id`, `status`, `tracking_code`, `updated_at`.

**Refactor sugerido:** Crear una factory function:

```typescript
// lib/clients/create-api-client.ts
function createApiClient(baseUrl: string, name: string) {
  return {
    get: <T>(path: string, headers?: Record<string, string>): ApiResult<T> => { ... },
    post: <T>(path: string, body: unknown): ApiResult<T> => { ... },
  };
}
```

---

### 6. [KISS] Post-procesamiento excesivo en liquidaciones *(CORREGIDO)*

**Ubicación:** `lib/db/queries/logistics/settlements.ts:44-151`  
**Principio:** Keep It Simple, Stupid  

**Estado:** ✅ Corregido el 29/05/2026. La agrupación por semana y día se movió a SQL con `date_trunc` + `JSON_AGG`. El post-procesamiento en JS pasó de 107 líneas (~4 loops anidados) a ~25 líneas (1 loop simple).

---

### 7. [DRY] Patrón de confirmación duplicado en componentes admin

**Ubicación:** 5+ componentes bajo `app/admin/` (delete-shipment, unassign-shipment, delete-driver, toggle-ban, delete-rate)  
**Principio:** Don't Repeat Yourself  

**Impacto:** Cada botón de acción destructiva replica el mismo patrón de estado: `isOpen` (dialog), `isPending` (loading), `handleConfirm` (llamar server action + cerrar dialog + refresh). El hook `useConfirmAction` existe en `lib/hooks/use-confirm-action.ts` pero no todos los componentes lo utilizan consistentemente.

**Refactor sugerido:** Estandarizar el uso del hook existente en todos los componentes de acción destructiva.

---

## Resumen ejecutivo

| Categoría | Score | Observación |
|---|---|---|
| Arquitectura general | **8/10** | Buena separación en capas. Route handlers de API pública son la excepción. |
| Seguridad | **5/10** | Fail-open en API key y BYPASS_RBAC sin guard son riesgos de producción. |
| DRY | **6/10** | Duplicación en API clients, error handling y patrón de confirmación. |
| KISS | **8/10** | Solo settlements tiene complejidad innecesaria. El resto es directo. |
| SOLID | **7/10** | SRP bien aplicado excepto en 2 route handlers con Prisma directo. |
| YAGNI | **9/10** | Código muerto prácticamente eliminado. |
