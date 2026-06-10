# 1.3 — Diseño de APIs Inter-Servicios

> **Tipo C — Marketplace**

Documentar cada endpoint que una app expone para ser consumido por otra app del sistema. Este contrato debe estar acordado por todos los integrantes antes de comenzar la Etapa 2.

---

## Convenciones Generales

- **Formato de nombres**: todos los campos JSON en `snake_case` (ej: `user_id`, `product_id`, `order_id`, `payment_id`, `shipping_id`). Prohibido mezclar `camelCase`.
- **Identificador correlacional**: `order_id` se genera en la Buyer App al iniciar la compra y se propaga como referencia a Seller, Payments y Shipping.
- **`condition` vs `status`**: en los endpoints públicos los productos exponen su **condición** (`condition`: `nuevo` | `usado`). El **estado interno de publicación** (`status`: `active` | `paused`) es visible únicamente en los endpoints administrativos. Los endpoints públicos solo devuelven productos con `status = active`.

---

## Buyer App — Endpoints expuestos

### `POST /api/buyer/pagos/:payment_id/confirmado`

- **Consumido por**: Payments App.
- **Descripción**: notifica al comprador que el pago fue aprobado para las órdenes incluidas.
- **Request body**:

```json
{
  "payment_id": "pay_01HXYZ...",
  "orders": [
    {
      "order_id": "ord_01HXYZ...",
      "mp_payment_id": "1234567890",
      "status": "approved",
      "amount": 15000.0,
      "currency": "ARS",
      "paid_at": "2026-04-17T14:32:00Z"
    }
  ]
}
```

- **Response 200**: `{ "ok": true }`

### `POST /api/buyer/pagos/:payment_id/rechazado`

- **Consumido por**: Payments App.
- **Descripción**: notifica rechazo / cancelación del pago para liberar las órdenes incluidas.
- **Request body**:

```json
{
  "payment_id": "pay_01HXYZ...",
  "orders": [
    {
      "order_id": "ord_01HXYZ...",
      "status": "rejected",
      "reason": "cc_rejected_insufficient_amount"
    }
  ]
}
```

- **Response 200**: `{ "ok": true }`

### `POST /api/buyer/ordenes/:order_id/estado-envio`

- **Consumido por**: Shipping App.
- **Descripción**: notifica cambios en el estado logístico del envío asociado a la orden.
- **Request body**:

```json
{
  "shipping_id": "shp_01HXYZ...",
  "status": "in_transit",
  "tracking_code": "BB-0001-2026",
  "updated_at": "2026-04-17T14:32:00Z"
}
```

- **Response 200**: `{ "ok": true }`

### `POST /api/buyer/:buyer_id`
- **Consumido por**: Shipping App.
- **Descripción**: Retorna los datos del buyer correspondiente al buyer_id.
- **Response 200**:

```json
{
    "id": "usr__01KR9...",
    "email": "buyer@mail.com",
    "full_name": "Carlos Perez",
    "phone_number": "291....",
    "address": {
        "zip": "8000",
        "number": "777",
        "street": "Lavalle "
    },
    "created_at": "2026-05-10T13:20:36.559Z"
}
```


---

## Seller App — Endpoints expuestos

### `GET /api/seller/productos`

- **Consumido por**: Buyer App, Control Plane, Analytics Dashboard.
- **Descripción**: lista los productos disponibles en el marketplace con soporte para filtros, paginación y ordenamiento.
- **Query params**:
  - `q` — búsqueda por texto en título/descripción.
  - `category_id` — filtrar por categoría.
  - `min_price`, `max_price` — rango de precio.
  - `seller_id` — filtrar por vendedor.
  - `condition` — filtrar por condición del producto (`nuevo`, `usado`, `all`). Default: `all`.
  - `sort_by` — campo de ordenamiento. Valores permitidos: `price`, `created_at`, `title`. Default: `created_at`.
  - `order` — dirección de ordenamiento: `asc` | `desc`. Default: `desc`.
  - `page` — número de página (1-indexed). Default: `1`.
  - `page_size` — cantidad de resultados por página. Default: `20`. Máximo: `100`.
- **Response 200**:

```json
{
  "items": [
    {
      "product_id": "prd_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "title": "Escritorio de madera",
      "price": 15000.0,
      "currency": "ARS",
      "category_id": "cat_muebles",
      "condition": "nuevo",
      "thumbnail_url": "https://...",
      "href": "https://.../api/seller/productos/prd_01HXYZ..."
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 134,
  "sort_by": "created_at",
  "order": "desc"
}
```

### `GET /api/seller/productos/:product_id`

- **Consumido por**: Buyer App, Control Plane.
- **Descripción**: obtiene el detalle público completo de un producto específico.
- **Response 200**:

```json
{
  "product_id": "prd_01HXYZ...",
  "seller": {
    "seller_id": "usr_01HXYZ...",
    "shop_name": "MaderPlac",
    "logo_url": "https://..."
  },
  "title": "Escritorio de madera",
  "description": "Escritorio de madera maciza, ideal para estudiantes. Muy buen estado.",
  "category_id": "cat_muebles",
  "category_name": "Muebles",
  "weight": 15,
  "height": 75,
  "width": 120,
  "depth": 60,
  "material": "Madera maciza",
  "color": "Marrón",
  "price": 15000.0,
  "currency": "ARS",
  "stock": 1,
  "condition": "nuevo",
  "images": ["https://..."],
  "created_at": "2026-04-10T10:00:00Z"
}
```

### `POST /api/seller/productos/batch`

- **Consumido por**: Buyer App.
- **Descripción**: devuelve la información de detalle de un lote de productos a partir de sus IDs. Se usa en los flujos donde la Buyer App necesita resolver múltiples productos en una sola llamada (ej: renderizar el carrito, la pantalla de favoritos, o el resumen de orden).
- **Request body**:

```json
{
  "product_ids": ["prd_01HXYZ...", "prd_01HABC...", "prd_01HDEF..."]
}
```

- **Validaciones**:
  - El array `product_ids` no puede estar vacío.

- **Response 200**:

```json
{
  "products": [
    {
      "product_id": "prd_01HXYZ...",
      "seller": {
        "seller_id": "usr_01HXYZ...",
        "shop_name": "MaderPlac",
        "logo_url": "https://..."
      },
      "title": "Escritorio de madera",
      "category_id": "cat_muebles",
      "price": 15000.0,
      "currency": "ARS",
      "stock": 1,
      "condition": "nuevo",
      "thumbnail_url": "https://...",
      "weight": 15,
      "height": 75,
      "width": 120,
      "depth": 60
    }
  ]
}
```

- **Response 400**: `{ "error": "product_ids is required and must be a non-empty array" }`

### `GET /api/seller/productos/:product_id/direccion-origen`

- **Consumido por**: Shipping App.
- **Descripción**: devuelve la dirección del vendedor del producto, usada como origen en la cotización y creación del envío.
- **Response 200**:

```json
{
  "origin_address": {
    "street": "San Martín",
    "number": "123",
    "zip": "8000"
  }
}
```

- **Response 404**: `NOT FOUND` si el producto no existe.

### `GET /api/seller/categorias`

- **Consumido por**: Buyer App, Control Plane.
- **Descripción**: devuelve el listado plano de las categorías de productos disponibles.
- **Response 200**:

```json
[
  {
    "category_id": "cat_muebles",
    "name": "Muebles"
  },
  {
    "category_id": "cat_electrodomesticos",
    "name": "Electrodomésticos"
  }
]
```

### `GET /api/seller/shops/:seller_id`

- **Consumido por**: Buyer App.
- **Descripción**: devuelve la información pública de la tienda de un vendedor, incluyendo datos generales, categorías en las que publica y el listado paginado de sus productos activos.
- **Query params**:
  - `page` — número de página (1-indexed). Default: `1`.
  - `page_size` — cantidad de productos por página. Default: `20`. Máximo: `100`.
- **Response 200**:

```json
{
  "seller_id": "usr_01HXYZ...",
  "shop_name": "Muebles del Sur",
  "bio": "Vendemos muebles de madera maciza hechos a mano.",
  "logo_url": "https://...",
  "cover_url": "https://...",
  "city": "Bahía Blanca",
  "total_products": 134,
  "categories": [
    {
      "category_id": "cat_muebles",
      "name": "Muebles"
    },
    {
      "category_id": "cat_electrodomesticos",
      "name": "Electrodomésticos"
    }
  ],
  "products": {
    "items": [
      {
        "product_id": "prd_01HXYZ...",
        "title": "Escritorio de madera",
        "price": 15000.0,
        "currency": "ARS",
        "category_id": "cat_muebles",
        "condition": "nuevo",
        "thumbnail_url": "https://...",
        "href": "https://.../api/seller/productos/prd_01HXYZ..."
      }
    ],
    "page": 1,
    "page_size": 20,
    "total": 134
  }
}
```

- **Response 404**: `NOT FOUND` si el vendedor no existe.

### `POST /api/seller/productos/:product_id/reservar`

- **Consumido por**: Payments App.
- **Descripción**: reserva el stock del producto para una orden en curso. La Seller App asigna `expires_at` internamente (TTL definido en el modelo de datos), por lo que el Buyer App no lo envía.
- **Request body**: `{ "order_id": "ord_01HXYZ...", "buyer_id": "usr_01HXYZ...", "buyer_name": "Juan Pérez", "product_id": "prd_01HXYZ...", "quantity": 3 }`
- **Response 200**: `{ "ok": true }`
- **Response 409**: `CONFLICT` si ya está reservado o vendido.

### `POST /api/seller/productos/:product_id/liberar-reserva`

- **Consumido por**: Payments App.
- **Descripción**: libera la reserva de stock de un producto, dejándolo disponible nuevamente.
- **Request body**: `{ "order_id": "ord_01HXYZ..." }`
- **Response 200**: `{ "ok": true }`
- **Response 404**: `NOT FOUND` si no existe una reserva activa para la orden.

### `POST /api/seller/pagos/:payment_id/confirmado`

- **Consumido por**: Payments App.
- **Descripción**: notifica al vendedor que el pago de sus productos fue aprobado. El Seller App resuelve `buyer_id`, `buyer_name` y la cantidad de unidades a partir de la `Reserva` previa identificada por `order_id` + `product_id`, por lo que Payments no necesita reenviarlos.
- **Request body**:

```json
{
  "payment_id": "pay_01HXYZ...",
  "orders": [
    {
      "order_id": "ord_01HXYZ...",
      "product_id": "prd_01HXYZ...",
      "quote_id": "qte_01HXYZ...",
      "amount": 15000.0,
      "fee": 150.0,
      "currency": "ARS",
      "paid_at": "2026-04-17T14:32:00Z"
    }
  ]
}
```

- **Response 200**: `{ "ok": true }`

### `POST /api/seller/ventas/:order_id/estado-envio`

- **Consumido por**: Shipping App.
- **Descripción**: notifica al vendedor las actualizaciones logísticas sobre el envío de su producto. Una orden corresponde a un único producto (puede incluir varias unidades del mismo), por lo que la actualización aplica a una sola venta.
- **Nota sobre `status`**: el valor recibido corresponde al vocabulario de la Shipping App (ej: `in_transit`, `delivered`, `failed`). El Seller App lo mapea a su enum interno (`shipping`, `delivered`, `shipping_failed`) al persistir la venta.
- **Request body**:

```json
{
  "order_id": "ord_01HXYZ...",
  "shipping_id": "shp_01HXYZ...",
  "status": "in_transit",
  "tracking_code": "BB-0001-2026",
  "updated_at": "2026-04-17T14:32:00Z"
}
```

- **Response 200**: `{ "ok": true }`

---

## Shipping App — Endpoints expuestos

### `POST /api/shipping/sellers/verificar-origen`

- **Consumido por**: Seller App.
- **Descripción**: verifica que una dirección de origen exista y esté dentro del área de cobertura (Bahía Blanca). El Seller App lo llama cuando el vendedor registra o actualiza la dirección de un producto, antes de publicarlo.
- **Request body**:

```json
{
  "product_id": "prd_01HXYZ...",
  "street": "San Martín",
  "number": "123",
  "zip": "8000"
}
```

- **Nota**: `zip` es opcional.

- **Response 200**: `{ "valid": true, "in_coverage_area": true }`
- **Response 400**:

```json
{ "valid": false, "error": "La dirección no existe", "code": "INVALID_ADDRESS" }
```

```json
{ "valid": false, "error": "La dirección está fuera de Bahía Blanca", "code": "OUTSIDE_COVERAGE" }
```

### `POST /api/shipping/cotizaciones`

- **Consumido por**: Buyer App.
- **Descripción**: calcula el costo y tiempo estimado de envío logístico entre dos domicilios.
- **Request body**:

```json
{
  "destination_address": { "street": "...", "number": "456", "zip": "8000" },
  "product_id": "prd_01HXYZ...",
  "weight_kg": 25,
  "height_cm": 80,
  "width_cm": 100,
  "depth_cm": 50
}
```

- **Response 200**:

```json
{
  "quote_id": "qte_01HXYZ...",
  "price": 3500.0,
  "currency": "ARS",
  "estimated_days": 2,
  "valid_until": "2026-04-17T15:32:00Z"
}
```

- **Response 400**:

```json
{ "error": "La dirección de destino está fuera del área de cobertura (Bahía Blanca)." }
```

```json
{ "error": "El producto está fuera del área de cobertura." }
```

```json
{ "error": "No se pudo calcular la cotización" }
```

### `POST /api/shipping/cotizaciones/reservar`

- **Consumido por**: Payments App.
- **Descripción**: reserva una cotización para una orden, evitando que sea utilizada por otra.
- **Request body**:

```json
{
  "quote_id": "qte_01HXYZ...",
  "order_id": "ord_01HXYZ..."
}
```

- **Response 200**: `{ "ok": true, "reserved_until": "2026-04-17T15:32:00Z" }`
- **Response 409**: `CONFLICT` si ya está reservada por otra orden.
- **Response 410**: `GONE` si la cotización ya ha vencido.

### `POST /api/shipping/cotizaciones/liberar-reserva`

- **Consumido por**: Payments App.
- **Descripción**: libera la reserva de una cotización, dejándola disponible nuevamente.
- **Request body**:

```json
{
  "quote_id": "qte_01HXYZ...",
  "order_id": "ord_01HXYZ..."
}
```

- **Response 200**: `{ "ok": true }`
- **Response 404**: `NOT FOUND` si no había reserva activa para esa orden.

### `POST /api/shipping/envios`

- **Consumido por**: Seller App (tras pago confirmado).
- **Descripción**: solicita la creación y gestión logística de un envío para una orden específica.
- **Request body**:

```json
{
  "order_id": "ord_01HXYZ...",
  "seller_id": "usr_01HXYZ...",
  "buyer_id": "usr_01HXYZ..."
}
```

- **Response 201**:

```json
{
  "shipping_id": "shp_01HXYZ...",
  "status": "waiting_for_courier",
  "tracking_code": "BB-0001-2026"
}
```

- **Response 400**: `Bad Request` si no existe una cotización reservada para la orden.

### `GET /api/shipping/envios/:order_id`

- **Consumido por**: Buyer App, Seller App, Control Plane.
- **Descripción**: permite consultar el estado actual y detalles de un envío asociado a una orden.
- **Response 200**:

```json
{
  "shipping_id": "shp_01HXYZ...",
  "order_id": "ord_01HXYZ...",
  "status": "in_transit",
  "tracking_code": "BB-0001-2026",
  "tracking_url": "https://shipping.unihousing.com/track/BB-0001-2026",
  "pickup_address": {
    "street": "San Martin",
    "number": "123",
    "zip": "8000"
  },
  "delivery_address": {
    "street": "Alsina",
    "number": "456",
    "floor": "7B",
    "zip": "8000"
  },
  "price": 3500.0,
  "picked_up_at": "2026-04-17T14:00:00Z",
  "delivered_at": null
}
```

---

## Payments App — Endpoints expuestos

### `POST /api/payments/ordenes-de-pago`

- **Consumido por**: Buyer App.
- **Descripción**: crea una intención de pago y retorna la preferencia de Mercado Pago Bricks para inicializar el checkout. Agrupa múltiples órdenes en una sola transacción.
- **Request body**:

```json
{
  "buyer_id": "usr_01HXYZ...",
  "buyer_name": "Carlos Perez"
  "orders": [
    {
      "order_id": "ord_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "product_id": "prd_01HXYZ...",
      "quantity": 3,
      "unit_price": 15000.0,
      "quote": {
        "quote_id": "qte_01HXYZ...",
        "shipping_price": 3500.0
      }
    }
  ],
  "currency": "ARS",
  "return_url": "https://buyer.unihousing/checkout/callback"
}
```

- **Response 201**:

```json
{
  "payment_id": "pay_01HXYZ...",
  "checkout_url": "https://payments.unihousing.com/checkout/...",
  "status": "pending"
}
```

### `GET /api/payments/ordenes-de-pago/:payment_id`

- **Consumido por**: Buyer App, Seller App, Control Plane, Analytics Dashboard.
- **Descripción**: consulta el estado actual de una orden de pago.
- **Response 200**:

```json
{
  "payment_id": "pay_01HXYZ...",
  "buyer_id": "usr_01HXYZ...",
  "orders": [
    {
      "order_id": "ord_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "product_id": "prd_01HXYZ...",
      "quote_id": "qte_01HXYZ...",
      "amount": 18500.0
    }
  ],
  "total_amount": 18500.0,
  "currency": "ARS",
  "status": "approved",
  "mp_payment_id": "1234567890",
  "mp_status_detail": "accredited",
  "created_at": "2026-04-17T14:30:00Z",
  "paid_at": "2026-04-17T14:32:00Z"
}
```

Estados soportados (mapeo Mercado Pago Sandbox): `pending`, `in_process`, `approved`, `rejected`, `cancelled`, `refunded`, `charged_back`, `in_mediation`.

### `POST /api/payments/webhooks/mercadopago`

- **Consumido por**: Mercado Pago (IPN/Webhook).
- **Descripción**: recibe notificaciones del estado del pago y actualiza el estado interno. Valida firma con `X-Signature` de MP.
- **Request body**:

```json
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": {
    "id": "1234567890"
  },
  "date_created": "2026-04-17T14:32:00Z",
  "id": 11223344,
  "live_mode": false,
  "type": "payment"
}
```

- **Response 200**: `OK`

---

## Endpoints Administrativos (Control Plane / Analytics)

> **Autenticación**: todos los endpoints de esta sección requieren un JWT de Clerk con `"admin" in roles`. Las apps deben validar este claim antes de procesar la solicitud. Los endpoints son consumidos exclusivamente por el Control Plane y el Analytics Dashboard (Etapa 3).

> **Contrato de respuesta paginada estándar**: todos los endpoints de listado siguen la misma estructura de respuesta con soporte para paginación, filtrado y ordenamiento.

### Seller App — Admin

#### `GET /api/seller/admin/productos`

- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado paginado de **todos** los productos del marketplace (incluye estados no activos), con filtros extendidos.
- **Query params**: `q`, `category_id`, `seller_id`, `status` (sin default — muestra todos; valores: `active`, `paused`), `condition` (`nuevo`, `usado`, `all`), `min_price`, `max_price`, `date_from`, `date_to`, `sort_by`, `order`, `page`, `page_size`.
- **Response 200**:

```json
{
  "items": [
    {
      "product_id": "prd_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "seller_name": "MaderPlac",
      "title": "Escritorio de madera",
      "thumbnail_url": "https://...",
      "price": 15000.0,
      "currency": "ARS",
      "category_id": "cat_muebles",
      "status": "active",
      "condition": "nuevo",
      "stock": 1,
      "created_at": "2026-04-10T10:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 312,
  "sort_by": "created_at",
  "order": "desc"
}
```

#### `GET /api/seller/admin/ventas`

- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado paginado de todas las ventas registradas.
- **Query params**: `seller_id`, `status`, `date_from`, `date_to`, `sort_by`, `order`, `page`, `page_size`.
- **Response 200**:

```json
{
  "items": [
    {
      "venta_id": "vnt_01HXYZ...",
      "order_id": "ord_01HXYZ...",
      "product_id": "prd_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "buyer_id": "usr_01HXYZ...",
      "amount": 15000.0,
      "status": "paid",
      "created_at": "2026-04-12T08:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 87,
  "sort_by": "created_at",
  "order": "desc"
}
```

#### `GET /api/seller/admin/stats`

- **Consumido por**: Analytics Dashboard.
- **Descripción**: métricas agregadas de la Seller App.
- **Query params**: `date_from`, `date_to` (rango temporal del reporte).
- **Response 200**:

```json
{
  "total_products": 312,
  "products_by_status": {
    "active": 198,
    "paused": 45
  },
  "total_sales": 87,
  "total_revenue": 1245000.0,
  "currency": "ARS"
}
```

### Buyer App — Admin

#### `GET /api/buyer/admin/ordenes`

- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado paginado de todas las órdenes del marketplace.
- **Query params**: `buyer_id`, `seller_id`, `status`, `date_from`, `date_to`, `sort_by`, `order`, `page`, `page_size`.
- **Response 200**:

```json
{
  "items": [
    {
      "order_id": "ord_01HXYZ...",
      "buyer_id": "usr_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "product_id": "prd_01HXYZ...",
      "total_amount": 18500.0,
      "status": "paid",
      "created_at": "2026-04-12T08:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 256,
  "sort_by": "created_at",
  "order": "desc"
}
```

#### `GET /api/buyer/admin/stats`

- **Consumido por**: Analytics Dashboard.
- **Descripción**: métricas agregadas de la Buyer App.
- **Query params**: `date_from`, `date_to`.
- **Response 200**:

```json
{
  "total_orders": 256,
  "orders_by_status": {
    "created": 12,
    "awaiting_payment": 5,
    "paid": 34,
    "shipping": 18,
    "delivered": 170,
    "cancelled": 10,
    "refunded": 4
  },
  "average_ticket": 14250.5,
  "currency": "ARS"
}
```

### Shipping App — Admin

> **Autenticación**: `x-api-key-hash` (service-to-service). Todos los endpoints de esta sección validan `INTERNAL_API_KEY`.

#### `GET /api/shipping/admin/envios`

- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado paginado de todos los envíos.
- **Query params**: `logistics_id`, `status`, `date_from`, `date_to`, `sort_by` (`created_at`, `price`, `status`), `order` (`asc`, `desc`), `page`, `page_size` (max 100).
- **Response 200**:

```json
{
  "items": [
    {
      "shipping_id": "shp_01HXYZ...",
      "order_id": "ord_01HXYZ...",
      "buyer_id": "usr_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "logistics_id": "usr_01HXYZ...",
      "status": "delivered",
      "tracking_code": "BB-0001-2026",
      "price": 3500.0,
      "picked_up_at": "2026-04-17T14:00:00Z",
      "delivered_at": "2026-04-17T16:30:00Z",
      "created_at": "2026-04-17T13:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 189,
  "sort_by": "created_at",
  "order": "desc"
}
```

#### `GET /api/shipping/admin/envios/:shipping_id`

- **Consumido por**: Control Plane.
- **Descripción**: detalle completo de un envío por `shipping_id`.
- **Response 200**:

```json
{
  "shipping_id": "shp_01HXYZ...",
  "order_id": "ord_01HXYZ...",
  "quote_id": "qte_01HXYZ...",
  "buyer_id": "usr_01HXYZ...",
  "seller_id": "usr_01HXYZ...",
  "logistics_id": "usr_01HXYZ...",
  "receiver_name": "Juan Pérez",
  "receiver_phone": "2911234567",
  "status": "delivered",
  "tracking_code": "BB-0001-2026",
  "price": 3500.0,
  "pickup_address": { "street": "San Martín", "number": "123", "zip": "8000" },
  "delivery_address": { "street": "Alsina", "number": "456", "floor": "7B", "zip": "8000" },
  "pickup_lat": -38.716,
  "pickup_lng": -62.266,
  "delivery_lat": -38.730,
  "delivery_lng": -62.280,
  "route_distance": 4.2,
  "route_duration": 900,
  "route_geometry": null,
  "weight": 15.0,
  "dimensions": { "width": 100, "height": 80, "depth": 50 },
  "picked_up_at": "2026-04-17T14:00:00Z",
  "delivered_at": "2026-04-17T16:30:00Z",
  "created_at": "2026-04-17T13:00:00Z"
}
```

- **Response 404**: `{ "error": "Envío no encontrado" }`

#### `PATCH /api/shipping/admin/envios/:shipping_id`

- **Consumido por**: Control Plane.
- **Descripción**: reasignar o desasignar el courier de un envío.
- **Request body**: `{ "logistics_id": "usr_01HXYZ..." | null }`
  - `logistics_id = null` → desasigna el courier y resetea el estado a `waiting_for_courier`.
  - `logistics_id = "usr_..."` → asigna el courier y cambia el estado a `pending_pickup`.
- **Response 200**:

```json
{
  "shipping_id": "shp_01HXYZ...",
  "status": "pending_pickup",
  "logistics_id": "usr_01HXYZ..."
}
```

- **Response 404**: Envío no encontrado.
- **Response 422**: Fletero no existe, está suspendido o no tiene rol `logistics`.

#### `GET /api/shipping/admin/drivers`

- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado paginado de couriers (usuarios con `role = "logistics"`).
- **Query params**: `q` (busca `full_name` o `email`), `banned` (`true`, `false`), `sort_by` (`created_at`, `full_name`), `order`, `page`, `page_size`.
- **Response 200**:

```json
{
  "items": [
    {
      "user_id": "usr_01HXYZ...",
      "full_name": "Pedro Ruiz",
      "email": "p@r.com",
      "banned": false,
      "active_shipments": 3,
      "created_at": "2026-04-10T10:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 12,
  "sort_by": "created_at",
  "order": "desc"
}
```

#### `PATCH /api/shipping/admin/drivers/:user_id`

- **Consumido por**: Control Plane.
- **Descripción**: suspender o rehabilitar un courier.
- **Request body**: `{ "banned": true | false }`
- **Response 200**:

```json
{
  "user_id": "usr_01HXYZ...",
  "banned": true
}
```

- **Response 404**: Usuario no encontrado.

#### `GET /api/shipping/admin/stats`

- **Consumido por**: Analytics Dashboard.
- **Descripción**: métricas agregadas de la Shipping App.
- **Query params**: `date_from`, `date_to`.
- **Response 200**:

```json
{
  "total_shipments": 189,
  "shipments_by_status": {
    "waiting_for_courier": 12,
    "pending_pickup": 8,
    "picked_up": 5,
    "in_transit": 8,
    "delivered": 155
  },
  "average_delivery_hours": 4.2
}
```

#### `GET /api/shipping/admin/stats/timeseries`

- **Consumido por**: Analytics Dashboard.
- **Descripción**: serie temporal de envíos o entregas por bucket (día, semana, mes).
- **Query params**: `date_from`, `date_to`, `granularity` (`day`, `week`, `month`), `metric` (`shipments`, `delivered`).
- **Response 200**:

```json
{
  "granularity": "day",
  "series": [
    { "bucket": "2026-06-01", "value": 4 },
    { "bucket": "2026-06-02", "value": 7 }
  ]
}
```

#### `GET /api/shipping/admin/usuarios`

- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado de usuarios locales (cache de Clerk) con rol `logistics`.
- **Query params**: `page`, `page_size`.
- **Response 200**:

```json
{
  "items": [
    {
      "user_id": "usr_01HXYZ...",
      "clerk_user_id": "user_2abc...",
      "email": "p@r.com",
      "full_name": "Pedro Ruiz",
      "role": "logistics",
      "banned": false,
      "created_at": "2026-04-10T10:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 12
}
```

### Payments App — Admin

#### `GET /api/payments/admin/ordenes-de-pago`

- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado paginado de todas las órdenes de pago.
- **Query params**: `buyer_id`, `seller_id`, `status`, `date_from`, `date_to`, `sort_by`, `order`, `page`, `page_size`.
- **Response 200**:

```json
{
  "items": [
    {
      "payment_id": "pay_01HXYZ...",
      "buyer_id": "usr_01HXYZ...",
      "orders": [
        {
          "order_id": "ord_01HXYZ...",
          "seller_id": "usr_01HXYZ...",
          "product_id": "prd_01HXYZ...",
          "quote_id": "qte_01HXYZ...",
          "amount": 18500.0
        }
      ],
      "total_amount": 18500.0,
      "currency": "ARS",
      "status": "approved",
      "created_at": "2026-04-17T14:30:00Z",
      "paid_at": "2026-04-17T14:32:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 203,
  "sort_by": "created_at",
  "order": "desc"
}
```

#### `GET /api/payments/admin/stats`

- **Consumido por**: Analytics Dashboard.
- **Descripción**: métricas agregadas de la Payments App.
- **Query params**: `date_from`, `date_to`.
- **Response 200**:

```json
{
  "total_payments": 203,
  "payments_by_status": {
    "pending": 8,
    "approved": 175,
    "rejected": 12,
    "refunded": 4,
    "cancelled": 3,
    "charged_back": 1
  },
  "total_volume": 3756000.0,
  "currency": "ARS",
  "approval_rate": 0.862
}
```

---
