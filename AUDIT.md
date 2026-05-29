# Reporte de Auditoria Arquitectonica

## Proyecto: C-Shipping Gema Market

**Stack:** Next.js 16 (App Router) + Prisma (PostgreSQL/Supabase) + Clerk + Tailwind CSS

**Fecha:** 27 de mayo de 2026

---

## 1. Diagnostico Arquitectonico

### Patron detectado: Feature-based con capas internas (Route Group + Smart/Dumb)

El proyecto usa **Route Groups de Next.js** (`(logistics)`, `admin`) como organizador principal, con un patron **Smart/Dumb component** bien implementado en la seccion logistics. La capa de backend sigue una arquitectura en 3 capas: **Routes (thin) -> Services (business logic) -> Queries (data access)**.

**Nivel de consistencia: 7/10**

**Fortalezas:**

- Excelente separacion Server/Client components con boundaries correctos
- Suspense boundaries con skeletons estructurales (streaming SSR)
- Estado via URL search params (compartible, bookmarkable)
- Config de navegacion centralizada (`config/`)
- Capa de servicios bien aislada (`lib/services/`)
- Clientes API externos con patron adapter (`lib/clients/`)
- Validacion con Zod en la mayoria de endpoints

**Debilidades principales:**

- La seccion admin **no sigue el mismo patron** que logistics: usa HTML crudo en lugar de componentes UI compartidos
- Componentes UI compartidos (`Table`, `Card`, `Badge`, `MetricCard`) **existen pero no se usan** en admin
- Boilerplate de autenticacion duplicado en 8 componentes
- Sin transacciones de base de datos en operaciones multi-step
- Sin paginacion en tablas admin

---

## 2. Reestructuracion de Archivos

| Archivo | Problema | Destino sugerido |
|---------|----------|-----------------|
| `lib/auth/getCurrentUserId.ts` | Naming camelCase vs kebab-case del hermano `get-internal-user-id.ts` | Renombrar a `get-current-user-id.ts` |
| `lib/auth/context.ts` | Posiblemente no usado (YAGNI). `getAuthContext()` compite con `getAuthContext` de headers | Verificar uso; si no se usa, eliminar |
| `lib/shared/utils.ts` | Mezcla utilidades UI (`cn`) con server-side (`generatePrefixedId`, `isNextDynamicServerError`) | Separar en `lib/shared/cn.ts` y `lib/shared/server-utils.ts` |
| `lib/db/queries/dashboard.ts` | Mezcla queries de operador y admin en un solo archivo | Separar en `operator-queries.ts` y `admin-queries.ts` |
| `app/dev/api-playground/page.tsx` | 489 lineas, god component | Extraer sub-componentes (`Fieldset`, `Input`, `CompactAppCard`) a archivos separados |
| `app/(logistics)/settlements/_components/earnings-list.tsx` | 254 lineas, mezcla layouts desktop/mobile + 3 niveles de nesting | Separar en `EarningsListDesktop` y `EarningsListMobile` |
| `app/(logistics)/courier/_components/courier-actions.tsx` | 4 exportaciones (3 componentes + 1 hook) en un archivo | Separar el hook `useCourierActions` a su propio archivo (o eliminar si es dead code) |

---

## 3. Violaciones de Principios

### CRITICAS

#### [SECURITY] `lib/auth/api-key.ts` - Fail-open + Timing attack

- **Problema:** Si `INTERNAL_API_KEY` es `undefined`, hashea un string vacio. Comparacion con `===` en vez de `crypto.timingSafeEqual`. Hash recalculado en cada request.
- **Solucion:** Validar que la env var exista (throw si falta). Usar `timingSafeEqual`. Cachear el hash como constante de modulo.

#### [SECURITY] `lib/auth/rbac.ts` - BYPASS_RBAC sin guard de entorno

- **Problema:** Si `BYPASS_RBAC` se activa accidentalmente en produccion, se saltan todos los chequeos de rol y se auto-crea un usuario mock.
- **Solucion:** Agregar un guard que verifique `NODE_ENV !== "production"` antes de permitir el bypass. Loguear un warning prominente cuando esta activo.

#### [SECURITY] `middleware.ts:34` vs `types/globals.d.ts` - Property name mismatch

- **Problema:** El middleware lee `sessionClaims.metadata.role` pero la declaracion de tipos usa `public_metadata`. Si Clerk provee el rol bajo `public_metadata`, el middleware no lo encuentra y `role` seria `undefined`.
- **Solucion:** Verificar la propiedad correcta que Clerk inyecta en `sessionClaims` y unificar ambos archivos.

#### [DATA INTEGRITY] `lib/services/shipment/shipment.service.ts` - Sin transacciones DB

- **Problema:** `createEnvioRecord` + `confirmCotizacion` no estan en una transaccion. Si el segundo falla, queda un envio sin cotizacion confirmada (estado inconsistente).
- **Solucion:** Envolver ambas operaciones en `prisma.$transaction()`.

#### [DATA INTEGRITY] `lib/actions/admin.actions.ts:19-27` - deleteDriverAction sin transaccion

- **Problema:** `updateMany` (reasigna envios) + `delete` (borra driver) son dos operaciones separadas. Si el delete falla, los envios ya estan reasignados pero el driver sigue existiendo.
- **Solucion:** Usar `prisma.$transaction([updateMany, delete])`.

#### [DATA INTEGRITY] `lib/services/quote/quote.service.ts` - Race conditions en reserve/release

- **Problema:** Patron read-then-write sin locks. Entre el `findUnique` y el `update`, otra request concurrente puede modificar la misma cotizacion.
- **Solucion:** Usar clausulas `WHERE` atomicas en el update (optimistic concurrency) o `prisma.$transaction` con `SELECT ... FOR UPDATE`.

#### [COLLISION] `lib/services/shipment/shipment.service.ts:10-14` - Tracking code con Math.random()

- **Problema:** Solo 9000 valores posibles por anio (`BB-1000-2026` a `BB-9999-2026`). Sin chequeo de unicidad contra DB. Colisiones probables a escala.
- **Solucion:** Usar ULID o secuencia DB. Agregar constraint UNIQUE en la columna `tracking_code`. Implementar retry logic.

### ALTAS

#### [DRY] 8 archivos `*-data.tsx` - Boilerplate de auth duplicado

- **Problema:** El patron `getAuthContext() -> getInternalUserId() -> if(!user) return null` se repite identico en 7 data components + 1 variante en `dashboard-header.tsx`.
- **Solucion:** Extraer un helper `getAuthenticatedUser()` que combine ambos pasos. O un HOC/wrapper `withAuth(Component)` que inyecte el user.

#### [DRY] `available-actions.tsx` vs `take-shipment-action.tsx` - Componente duplicado

- **Problema:** `TakeShipmentButton` y `TakeShipmentAction` son casi identicos: mismo state, mismo toast, mismo handler, mismo styling.
- **Solucion:** Un unico componente `TakeShipmentButton` reutilizable, importado en ambos lugares.

#### [DRY] `lib/db/queries/dashboard.ts` + `lib/db/queries/shipment.ts` - summarySelect + toSummary duplicados

- **Problema:** El mismo objeto `select` de Prisma y la misma funcion mapper estan copiados en ambos archivos.
- **Solucion:** Extraer a un modulo compartido `lib/db/queries/shared-selectors.ts`.

#### [DRY] `lib/clients/buyer-api/buyer-api.client.ts` + `lib/clients/seller-api/seller-api.client.ts` - Estructura identica

- **Problema:** Patron fetch/error/mock casi identico. Los tipos `BuyerStatusUpdate` y `SellerStatusUpdate` comparten la mayoria de campos.
- **Solucion:** Crear una factory function `createApiClient(baseUrl, name)` que encapsule el patron comun. Extraer un tipo base `StatusUpdatePayload`.

#### [DRY] 5 componentes admin - Patron handleConfirm duplicado

- **Problema:** `delete-shipment-button`, `unassign-shipment-button`, `delete-driver-button`, `toggle-ban-button`, `delete-rate-button` repiten el mismo patron `isOpen + isPending + handleConfirm + router.refresh()`.
- **Solucion:** Crear un custom hook `useConfirmAction(serverAction, { onSuccess, onError })`.

#### [DRY] 3 archivos admin - STATUS_LABELS y STATUS_COLORS duplicados

- **Problema:** Mapas de labels/colores de status copiados en `dashboard-metrics.tsx`, `shipments-table-data.tsx`, `driver-detail-data.tsx`.
- **Solucion:** Ya existen `SHIPMENT_STATUS_LABELS` en `lib/shared/shipment-constants.ts`. Usarlos como SSOT.

#### [SOLID/SRP] `app/(logistics)/available/_components/available-data.tsx` - Prisma directo en componente

- **Problema:** Usa `prisma.usuario.findUnique()` directamente para chequear ban. Rompe la capa de data access.
- **Solucion:** Mover el chequeo de ban a una query function en `lib/db/queries/`.

#### [SOLID/SRP] `app/(logistics)/shipments/[shipping-id]/_components/package-info.tsx` - Logica de negocio en UI

- **Problema:** Calculo de peso volumetrico (`volumeM3 * 250`) y peso facturable (`Math.max`) estan en un componente presentacional.
- **Solucion:** Calcular estos valores en la capa de datos/query y pasarlos como props ya resueltos.

#### [SOLID/SRP] `app/(logistics)/courier/_components/courier-data.tsx` - Logica de transicion en UI

- **Problema:** La logica de que transicion corresponde a cada estado (lines 67-79) es business logic embebida en un componente cliente.
- **Solucion:** Extraer a `lib/shared/shipment-constants.ts` como un mapa de transiciones.

### MEDIAS

#### [KISS] 7 API routes - Error handling boilerplate repetido

- **Problema:** El mismo `try/catch` con `err.statusCode` check se repite en los 7 route handlers.
- **Solucion:** Crear un wrapper `withApiHandler(fn)` que centralice el error handling. El proyecto ya tiene `lib/shared/api-handler.ts` pero solo maneja debug traces.

#### [KISS] `lib/db/queries/settlement.ts:44-151` - Complejidad innecesaria

- **Problema:** 107 lineas de loops anidados construyendo maps de maps para agrupar por semana/dia. La query SQL ya agrupa por semana.
- **Solucion:** Una sola query SQL que agrupe por semana Y dia simultaneamente, eliminando el post-procesamiento en JS.

#### [YAGNI] `lib/validations/api-schemas.ts` - `updateStatusSchema` posiblemente no usado

- **Problema:** Schema exportado pero no se encontro ningun route que lo importe.
- **Solucion:** Verificar uso; si no se usa, eliminar.

#### [YAGNI] `lib/auth/user-cache.ts` - `clearUserCache()` posiblemente no usado

- **Problema:** Funcion exportada pero no se encontro ningun import.
- **Solucion:** Verificar uso; si no se usa, eliminar.

#### [YAGNI] `app/(logistics)/courier/_components/courier-actions.tsx` - Hook `useCourierActions` dead code

- **Problema:** Hook exportado pero nunca importado en ningun lado.
- **Solucion:** Eliminar.

#### [HAPPY PATH] `return null` silencioso en todos los data components

- **Problema:** Cuando falla auth o no se encuentra el usuario, todos los `*-data.tsx` retornan `null`. El Suspense resuelve con vacio, el usuario ve una seccion sin explicacion.
- **Solucion:** Retornar un componente de error/redirect en vez de `null`. O al menos un mensaje "No se pudo cargar".

#### [HAPPY PATH] `.parse()` en vez de `.safeParse()` en search params

- **Problema:** `available-data.tsx` y `history-data.tsx` usan `.parse()` que lanza excepcion en vez de manejar gracefulmente params invalidos.
- **Solucion:** Usar `.safeParse()` y mostrar un estado de error o defaults.

#### [HAPPY PATH] `lib/services/exchange-rate/index.ts` - Fallback silencioso

- **Problema:** Si la API de dolar falla, usa `DEFAULT_USD_RATE` o un hardcoded `1200` sin notificar al cliente. Precios potencialmente incorrectos.
- **Solucion:** Loguear un warning. Considerar retornar error al cliente si la tasa no es confiable.

#### [HAPPY PATH] Cobertura via string matching

- **Problema:** `lib/services/quote/quote.service.ts:29` y `verificar-origen/route.ts:39` verifican cobertura chequeando si `displayName.includes("Bahia Blanca")`. Fragil: Nominatim no garantiza formato estable.
- **Solucion:** Usar bounding box geografico (coordenadas) para verificar cobertura en vez de matching de string.

#### [CONSISTENCY] Status code de validacion inconsistente

- **Problema:** `/api/shipping/shipments` retorna 400 para errores Zod. `/api/shipping/sellers/verificar-origen` retorna 422. No hay convencion.
- **Solucion:** Convencion: 400 para errores de validacion (segun contrato). Cambiar verificar-origen y shipments route a 400.

#### [CONSISTENCY] Naming mixto espaniol/ingles

- **Problema:** `findReservedCotizacion`, `confirmCotizacion`, `getEnvioCoords` mezclan espaniol. Sub-componentes `Cabecera`, `Cuerpo`, `Pie` en `shipment-card.tsx`.
- **Solucion:** Estandarizar a ingles para codigo, espaniol solo para labels de UI.

### BAJAS

#### Comentarios stale

- **Problema:** Multiples archivos referencian `app/(operator)/` en comentarios cuando el route group actual es `app/(logistics)/`.
- **Archivos afectados:** `_components/index.ts`, `Sidebar.tsx`, `MobileNav.tsx`, `shipment-details-header.tsx`.
- **Solucion:** Actualizar o eliminar los comentarios.

#### Barrel file incompleto

- **Problema:** `_components/index.ts` en logistics exporta `Sidebar`, `MobileNav`, `ShipmentStatusBadge` pero NO `page-layout`, que es el componente mas importado.
- **Solucion:** Agregar `page-layout` al barrel o documentar la convencion.

#### Placeholders hardcodeados en route-info

- **Problema:** `route-info.tsx` tiene horarios estaticos `"10:30"` y `"11:15 ETA"` que son placeholders de diseno nunca reemplazados.
- **Solucion:** Conectar con datos reales o eliminar los placeholders.

#### HTML invalido

- **Problema:** `<p>` anidado dentro de `<span>` en `shipment-card.tsx:30-31`. `<Link>` wrapping `<Button>` produce `<a><button>` en `error.tsx` y `not-found.tsx`.
- **Solucion:** Corregir la estructura HTML. Para Link+Button, usar el prop `asChild` o estilizar el Link directamente.

#### `import React from "react"` innecesario

- **Problema:** `shipment-card.tsx` importa React explicitamente. Con el nuevo JSX transform de Next.js no es necesario.
- **Solucion:** Eliminar el import.

#### `border-ink` typo en skeleton

- **Problema:** `metrics-grid-skeleton.tsx:7` usa `border-ink` cuando probablemente deberia ser `border-line`.
- **Solucion:** Verificar y corregir.

---

## 4. Mejoras en Stack (React/Supabase/Clerk)

### React

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| `tabs.tsx` sin `"use client"` | Bug | Tiene `onClick` handlers pero no tiene la directiva. Fallara en Server Components. |
| `<Link>` wrapping `<Button>` | A11y | Produce `<a><button>`, HTML invalido. En `error.tsx` y `not-found.tsx`. |
| `SearchInput` sin debounce | Performance | Dispara `router.push` en cada keystroke, causando re-renders excesivos. |
| Sin paginacion en admin | Performance | `getAllDrivers` y `getAllShipments` cargan todos los registros. Degradara con datos. |
| `earnings-list.tsx` con 7 niveles de indentacion | Legibilidad | Componente mas grande de logistics (254 lineas). Separar desktop/mobile. |
| `map-viewer.tsx` expone API key hash en cliente | Security | `NEXT_PUBLIC_INTERNAL_API_KEY_HASH` en el bundle del cliente. |
| Sin toast system | UX | Solo 2 componentes implementan toast custom. El resto loguea a `console.error`. |
| Sin optimistic updates | UX | Todas las mutaciones esperan round-trip al server antes de actualizar UI. |
| `performance-module-wrapper.tsx` tipo innecesariamente complejo | Legibilidad | Usa `Awaited<ReturnType<typeof import(...)>>` en vez de importar el tipo `PerformanceData` directamente. |
| Colores hardcodeados en chart config | Consistencia | `#936639`, `#ede7d8`, etc. en `performance-module.tsx` en vez de CSS custom properties o theme tokens. |

### Supabase/Prisma

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| **No hay cliente Supabase** | Info | El proyecto usa Prisma + `pg.Pool` con `DIRECT_URL`. Supabase es solo el host de la DB. |
| Sin indices en columnas frecuentes | Performance | `Envio.status`, `Envio.logistics_id`, `Envio.created_at`, `Usuario.role`, `Usuario.banned` no tienen indices. |
| `role` y `status` como `String` sin enum | Integridad | La DB acepta cualquier string. Los valores validos solo se validan en aplicacion. |
| `Tarifa.weight_range` como JSON | Performance | No indexable con B-tree. Dos columnas separadas (`weight_min`, `weight_max`) serian mas eficientes. |
| Sin `updated_at` en ningun modelo | Auditoria | Imposible saber cuando se modifico un registro por ultima vez. |
| Sin soft delete | Integridad | `deleteShipmentAction` y `deleteDriverAction` hacen hard delete. Las cotizaciones quedan huerfanas. |
| Pool sin configuracion | Resiliencia | `new Pool()` sin pool size, timeout, ni retry config. |
| `Cotizacion` sin relacion formal a `Envio` | Integridad | `Envio.quote_id` es una FK logica, sin constraint de DB. No hay cascade ni integridad referencial. |
| `dimensions` como JSON pero `weight` como columna | Consistencia | Weight es queryable pero dimensions no. Decision inconsistente. |

### Clerk

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| Property mismatch middleware vs types | Bug potencial | `sessionClaims.metadata.role` vs `public_metadata.role` en `globals.d.ts`. |
| Cache en memoria no funciona en serverless | Arquitectura | `user-cache.ts` usa `Map` con TTL 30s. En Vercel/serverless se resetea en cada cold start. |
| `invalidateUserCache` no propaga | Multi-instancia | La invalidacion de cache es local al proceso. En deployments multi-instancia, otros servidores siguen con datos stale. |
| Sin defensa en profundidad en API | Security | `/api(.*)` es publico en middleware. Si un route olvida `validateApiKey()`, queda expuesto. |
| Sidebar hardcodea "Repartidor - Activo" | UX | El label de rol en `Sidebar.tsx` es estatico, no refleja el rol real del usuario. |
| `getCurrentUserId.ts` auto-provisioning en lectura | Side effect | La funcion de "obtener ID" crea usuarios en DB y actualiza Clerk metadata. Efecto secundario sorprendente para una funcion de lectura. |

### Manejo de Errores - Resumen de Patrones

| Patron | Donde se usa | Problema |
|--------|-------------|----------|
| `{ success: false, error }` | Server Actions | Consistente pero los errores se loguean a `console.error` y no se muestran al usuario (excepto `create-rate-form`). |
| `throw Object.assign(Error, { statusCode })` | Services + API routes | Buen patron, pero el boilerplate catch esta duplicado en 7 routes. |
| `{ error, status: 503 }` | API clients | Correcto para fallos de red, pero `details` usa tipo `any`. |
| `return null` | Data components | Silencioso. El usuario no sabe que fallo. |
| Sin toast system | Global | Solo 2 componentes implementan toast custom. El resto loguea a consola. |

---

## 5. Estrategia de Testing

### Estructura de carpetas recomendada

```
__tests__/
  unit/
    services/
      quote.service.test.ts
      shipment.service.test.ts
      notification.service.test.ts
    auth/
      api-key.test.ts
      rbac.test.ts
    utils/
      price-calculator.test.ts
      date-utils.test.ts
  integration/
    api/
      quotes.test.ts
      shipments.test.ts
      reserve-release.test.ts
    actions/
      shipment-actions.test.ts
      admin-actions.test.ts
  e2e/ (futuro)
    shipping-flow.test.ts
```

**Framework recomendado:** Vitest (compatible con el ecosistema Next.js/React, rapido, ESM-native).

### 3 puntos criticos a testear primero

#### 1. Flujo completo de cotizacion -> reserva -> release

**Archivos:** `lib/services/quote/quote.service.ts` + `lib/services/quote/state-validations.ts` + `lib/services/quote/price-and-time-calculator.ts`

**Por que:** Es el core del negocio. Incluye calculos de precio, conversion de moneda, validaciones de estado (expiracion, conflictos), y las race conditions identificadas. Un bug aqui = perdida de dinero.

**Tests a escribir:**

- Calcular precio con diferentes pesos/dimensiones/distancias
- Peso volumetrico vs peso real (billable weight)
- Reservar cotizacion expirada (debe fallar)
- Reservar cotizacion ya reservada por otro order (debe fallar 409)
- Reservar cotizacion ya confirmada (debe fallar)
- Release de cotizacion correcta
- Release con order_id incorrecto (debe fallar)
- Fallback de exchange rate cuando la API falla
- Cobertura: direccion dentro vs fuera de Bahia Blanca

#### 2. Maquina de estados de envios

**Archivos:** `lib/actions/shipment.actions.ts` + `lib/services/notification/notification.service.ts`

**Por que:** Las transiciones de estado (`waiting_for_courier -> pending_pickup -> picked_up -> in_transit -> delivered`) son el corazon operativo. Transiciones invalidas deben rechazarse. Las notificaciones deben enviarse a las partes correctas.

**Tests a escribir:**

- Cada transicion valida (take, pickup, transit, deliver, cancel)
- Transiciones invalidas (ej: deliver sin pickup)
- Cancelacion en estados permitidos vs no permitidos
- Notificaciones al seller vs buyer segun transicion
- Usuario baneado no puede tomar envios
- Usuario con rol incorrecto no puede ejecutar transiciones
- Courier que no es dueno del envio no puede transicionarlo

#### 3. Validacion de API Key y RBAC

**Archivos:** `lib/auth/api-key.ts` + `lib/auth/rbac.ts`

**Por que:** Es la capa de seguridad. El fail-open de `api-key.ts` y el bypass de `BYPASS_RBAC` son vulnerabilidades que deben tener regression tests.

**Tests a escribir:**

- Key valida acepta request
- Key invalida rechaza request
- Key ausente (header faltante) rechaza request
- `INTERNAL_API_KEY` undefined rechaza (no fail-open)
- Roles correctos permiten acceso a rutas protegidas
- Roles incorrectos redirigen a la pagina correspondiente
- `BYPASS_RBAC` solo funciona en development
- Usuario sin rol asignado es redirigido a `/unauthorized`

---

## 6. Design System - Componentes sin usar

Los siguientes componentes existen en `components/ui/` pero **no se usan** en la seccion admin:

| Componente | Archivo | Donde deberia usarse |
|------------|---------|---------------------|
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | `components/ui/table.tsx` | Las 4 tablas admin (shipments, drivers, driver detail, rates) |
| `Card` | `components/ui/card.tsx` | Contenedores de admin que usan `bg-paper border border-line rounded-r2 p-5` inline |
| `Badge` | `components/ui/badge.tsx` | Status badges en admin (shipments status, driver ban state) |
| `MetricCard` | `components/ui/metric-card.tsx` | KPIs en admin dashboard y driver detail |
| `Button` | `components/ui/button.tsx` | Multiples botones admin usan `<button>` crudo (confirm-dialog, create-rate-form, unauthorized page) |
| `Pagination` | `components/ui/pagination.tsx` | Tablas admin que cargan todos los registros sin paginar |

**Impacto:** Refactorizar las tablas admin para usar estos componentes eliminaria ~40% del HTML duplicado y centralizaria la consistencia visual.

---

## 7. Resumen Ejecutivo

| Categoria | Score | Comentario |
|-----------|-------|------------|
| Arquitectura general | **7/10** | Buena base con Route Groups + Smart/Dumb. Admin inconsistente con logistics. |
| Principios SOLID | **6/10** | SRP generalmente bien. Algunas violaciones en data components y actions. |
| DRY | **5/10** | Multiples duplicaciones claras (auth boilerplate, STATUS_LABELS, TakeShipment, API clients, confirm action pattern). |
| YAGNI | **8/10** | Poco codigo innecesario. Algunas funciones/hooks posiblemente sin uso. |
| KISS | **7/10** | Mayormente simple. `settlement.ts` y `api-playground` son excesivamente complejos. |
| Seguridad | **5/10** | Fail-open en API key, BYPASS_RBAC sin guard, timing attack, API hash en cliente, property mismatch en Clerk. |
| Manejo de errores | **5/10** | Patron consistente pero boilerplate duplicado. `return null` silencioso. Sin toast system. |
| Design System | **5/10** | Componentes UI bien construidos pero significativamente subutilizados (Table, Card, Badge, MetricCard no se usan en admin). |
| Testing | **1/10** | Sin tests automatizados. Solo api-playground manual y un script bash. |
| **Promedio** | **5.9/10** | Proyecto funcional con buena base arquitectonica. Las areas criticas son seguridad, DRY, y testing. |

### Prioridades inmediatas

1. **Seguridad** - api-key fail-open, BYPASS_RBAC sin guard, property mismatch en middleware/Clerk
2. **Transacciones DB** - shipment creation, driver deletion, quote reserve/release
3. **DRY mas impactante** - auth boilerplate x8, TakeShipment duplicado, STATUS_LABELS x3, confirm action pattern x5
