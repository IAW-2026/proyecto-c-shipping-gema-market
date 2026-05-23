+# 1.2 — Asignación de Responsabilidades

> **Tipo C — Marketplace**

## Distribución de webapps

| App | Responsable | Repositorio |
|-----|-------------|-------------|
| Buyer App | Gonzalo Ferraro | `proyecto-c-buyer-[gonzalo]` |
| Seller App | Manuel Ducos | `proyecto-c-seller-[manuel]` |
| Shipping App | Emiliano Sensini | `proyecto-c-shipping-[emiliano]` |
| Payments App | Agustin Echavarria | `proyecto-c-payments-[agustin]` |
| Control Plane | Equipo completo | `proyecto-c-control-plane-unihousing` |
| Analytics Dashboard | Equipo completo | `proyecto-c-analytics-unihousing` |

---

## Datos propios de cada app

> **Regla de integración**: el `order_id` se genera en la **Buyer App** en el momento de iniciar la compra y es el identificador correlacional global del flujo. Todas las apps lo persisten como clave foránea lógica para trazabilidad inter-servicios.

### Buyer App
- `usuario` (cache de identidad — fuente de verdad: Clerk)
- `orden` (incluye `payment_id` FK-lógica → Payments, `quote_id` y `shipping_id` FK-lógica → Shipping, `seller_id` y `product_id` FK-lógica → Seller)
- `carrito`
- `item_carrito`
- `favorito`

### Seller App
- `usuario` (cache de identidad)
- `producto` (incluye `status`: `active` | `paused` | `blocked` | `sold`)
- `categoria`
- `venta` (incluye `order_id` FK-lógica → Buyer, `payment_id` FK-lógica → Payments, `quote_id` FK-lógica → Shipping)
- `reserva` (vincula `product_id` con `order_id` mientras el pago está pendiente)

### Shipping App
- `usuario` (cache de identidad)
- `cotizacion` (expuesta como `quote_id`; incluye precio, días estimados y `expires_at`)
- `envio` (incluye `order_id` FK-lógica → Buyer, `seller_id`, `buyer_id`)
- `tarifa`

### Payments App
- `usuario` (cache de identidad)
- `orden_de_pago` (incluye `orders` JSON con el detalle de cada orden, `mp_preference_id`, `mp_payment_id`)
- `transaccion` (eventos de Mercado Pago)
- `disputa` (incluye `order_id` y `payment_id`)

---

## Datos o acciones que requieren comunicación entre apps

> **Convención**: el parámetro de ruta unificado es `:order_id` (generado por Buyer App). Los nombres de campos en los JSON siguen `snake_case`.

| App origen | Acción / dato necesario | App destino | API involucrada |
|------------|--------------------------|-------------|-----------------|
| Buyer App | Obtener catálogo de productos con filtros | Seller App | `GET /api/seller/productos` |
| Buyer App | Obtener detalle de un producto | Seller App | `GET /api/seller/productos/:product_id` |
| Buyer App | Obtener listado de categorías | Seller App | `GET /api/seller/categorias` |
| Buyer App | Consultar cotización de envío antes de pagar | Shipping App | `POST /api/shipping/cotizaciones` |
| Buyer App | Iniciar pago de una compra | Payments App | `POST /api/payments/ordenes-de-pago` |
| Buyer App | Abrir una disputa por problema en la compra | Payments App | `POST /api/payments/disputas` |
| Payments App | Reservar stock del producto al iniciar checkout | Seller App | `POST /api/seller/productos/:product_id/reservar` |
| Payments App | Liberar reserva de stock al rechazar pago | Seller App | `POST /api/seller/productos/:product_id/liberar-reserva` |
| Payments App | Reservar cotización de envío al iniciar checkout | Shipping App | `POST /api/shipping/cotizaciones/reservar` |
| Payments App | Liberar cotización de envío al rechazar pago | Shipping App | `POST /api/shipping/cotizaciones/liberar-reserva` |
| Payments App | Notificar disputa abierta al vendedor | Seller App | `POST /api/seller/ventas/:order_id/disputa-abierta` |
| Payments App | Notificar resolución de disputa al comprador | Buyer App | `POST /api/buyer/ordenes/:order_id/disputa-resuelta` |
| Payments App | Notificar resolución de disputa al vendedor | Seller App | `POST /api/seller/ventas/:order_id/disputa-resuelta` |
| Payments App | Notificar pago aprobado al vendedor | Seller App | `POST /api/seller/pagos/:payment_id/confirmado` |
| Payments App | Notificar pago aprobado al comprador | Buyer App | `POST /api/buyer/pagos/:payment_id/confirmado` |
| Payments App | Notificar pago rechazado / cancelado al comprador | Buyer App | `POST /api/buyer/pagos/:payment_id/rechazado` |
| Seller App | Solicitar creación del envío | Shipping App | `POST /api/shipping/envios` |
| Shipping App | Obtener dirección de origen del vendedor | Seller App | `GET /api/seller/productos/:product_id/direccion-origen` |
| Shipping App | Notificar cambio de estado del envío al comprador | Buyer App | `POST /api/buyer/ordenes/:order_id/estado-envio` |
| Shipping App | Notificar cambio de estado del envío al vendedor | Seller App | `POST /api/seller/ventas/:order_id/estado-envio` |
| Control Plane | Resolver disputa abierta por un usuario | Payments App | `POST /api/payments/disputas/:dispute_id/resolver` |

---

## Exposición de datos para apps globales (Etapa 3)

> **Contexto**: en la Etapa 3 se construyen dos aplicaciones transversales colaborativas — **Control Plane** y **Analytics Dashboard** — que necesitan consumir datos de las 4 apps individuales sin acceder directamente a sus bases de datos.

### Estrategia

Cada app individual expone un conjunto de **endpoints administrativos** bajo el prefijo `/api/<app>/admin/`, protegidos por el claim `roles: ["admin"]` del JWT de Clerk. Estos endpoints son independientes de los endpoints orientados al usuario final y están diseñados para devolver información **paginada, filtrable y agregada**.

| App | Endpoints admin expuestos | Consumidor principal |
|-----|--------------------------|---------------------|
| Seller App | `GET /api/seller/admin/productos`, `GET /api/seller/admin/ventas`, `GET /api/seller/admin/stats` | Control Plane (CRUD + lectura), Analytics Dashboard (lectura + métricas) |
| Buyer App | `GET /api/buyer/admin/ordenes`, `GET /api/buyer/admin/stats` | Control Plane, Analytics Dashboard |
| Shipping App | `GET /api/shipping/admin/envios`, `GET /api/shipping/admin/stats` | Control Plane, Analytics Dashboard |
| Payments App | `GET /api/payments/admin/ordenes-de-pago`, `GET /api/payments/admin/disputas`, `GET /api/payments/admin/stats` | Control Plane, Analytics Dashboard |

- El **Control Plane** consume endpoints de lectura y de acción (ej. resolver disputas, desactivar productos).
- El **Analytics Dashboard** consume exclusivamente endpoints de lectura y métricas agregadas (`/stats`).
- Los contratos detallados se definen en el [documento de APIs](03-apis.md).