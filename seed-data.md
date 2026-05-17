# API Playground — Datos para pruebas manuales

> Todas las direcciones corresponden a **Bahía Blanca**. Las coordenadas y rutas se calculan automáticamente vía ORS (geocoding + routing).

---

## 1. Setup inicial

### 1.1 Crear tarifas

```bash
curl -X POST http://localhost:3000/api/shipping/rates \
  -H "Content-Type: application/json" \
  -d '{
    "weight_range": { "min": 0, "max": 2 },
    "volume_range": { "min": 0, "max": 0.01 },
    "price_per_km": 150.0
  }'
```

```bash
curl -X POST http://localhost:3000/api/shipping/rates \
  -H "Content-Type: application/json" \
  -d '{
    "weight_range": { "min": 2, "max": 5 },
    "volume_range": { "min": 0.01, "max": 0.05 },
    "price_per_km": 200.0
  }'
```

```bash
curl -X POST http://localhost:3000/api/shipping/rates \
  -H "Content-Type: application/json" \
  -d '{
    "weight_range": { "min": 5, "max": 20 },
    "volume_range": { "min": 0.05, "max": 0.2 },
    "price_per_km": 350.0
  }'
```

### 1.2 Crear usuario fletero (mock)

```bash
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{
    "id": "usr_mock",
    "clerk_user_id": "mock_clerk",
    "email": "operador@example.com",
    "full_name": "Gema Logística",
    "role": "logistics"
  }'
```

---

## 2. Cotizaciones

### 2.1 Cotización 1 — San Martín → Belgrano

```bash
curl -X POST http://localhost:3000/api/shipping/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "destination_address": {
      "street": "Belgrano",
      "number": "150",
      "zip": "B8000"
    },
    "product_id": "prod_abc123",
    "weight_kg": 1.5,
    "height_cm": 20,
    "width_cm": 15,
    "depth_cm": 10
  }'
```

**Response esperado (200):**
```json
{
  "quote_id": "qte_...",
  "price": 2000.0,
  "currency": "ARS",
  "estimated_days": 3,
  "valid_until": "2026-..."
}
```

> La cotización guarda automáticamente `pickup_lat/lng`, `delivery_lat/lng`, `route_distance` y `route_duration`.

### 2.2 Cotización 2 — Estomba → Chiclana

```bash
curl -X POST http://localhost:3000/api/shipping/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "destination_address": {
      "street": "Chiclana",
      "number": "209",
      "zip": "B8000"
    },
    "product_id": "prod_def456",
    "weight_kg": 4.0,
    "height_cm": 40,
    "width_cm": 30,
    "depth_cm": 20
  }'
```

---

## 3. Reservar cotización

Guardar el `quote_id` de la respuesta anterior.

```bash
curl -X POST http://localhost:3000/api/shipping/quotes/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "quote_id": "qte_...",
    "order_id": "ord_test123"
  }'
```

**Response esperado (200):**
```json
{
  "reserved_until": "2026-..."
}
```

---

## 4. Obtener datos del comprador (Buyer App)

> Endpoint externo — la **Buyer App** expone `POST /api/buyer/:buyer_id`. La Shipping App lo consume automáticamente en `createShipment` si falta `receiver_name` o `receiver_phone`.

```bash
curl -X POST http://localhost:3002/api/buyer/usr_01KR9... \
  -H "Content-Type: application/json"
```

**Response esperado (200):**
```json
{
  "id": "usr_01KR9...",
  "email": "buyer@mail.com",
  "full_name": "Carlos Pérez",
  "phone_number": "2915550101",
  "address": {
    "zip": "8000",
    "number": "777",
    "street": "Lavalle"
  },
  "created_at": "2026-05-10T13:20:36.559Z"
}
```

> Si la Buyer App no está disponible, `envio.service.ts` usa un fallback con `full_name: "Comprador"` y `phone_number: "2910000000"`.

---

## 5. Crear envíos

> El `buyer_id` debe existir en la Buyer App. Si la Buyer App no responde, se usa fallback.

### 5.1 Envío con receiver_name y receiver_phone explícitos

```bash
curl -X POST http://localhost:3000/api/shipping/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ord_test123",
    "seller_id": "usr_seller_01",
    "buyer_id": "usr_buyer_01",
    "receiver_name": "Carlos García",
    "receiver_phone": "+54 11 5555-0101"
  }'
```

### 5.2 Envío SIN receiver_name/receiver_phone (usa Buyer API)

```bash
curl -X POST http://localhost:3000/api/shipping/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ord_test456",
    "seller_id": "usr_seller_01",
    "buyer_id": "usr_buyer_02"
  }'
```

> En este caso, `createShipment()` llama a `buyerApiClient.getBuyerData(buyer_id)` para obtener `full_name` y `phone_number`. Si la Buyer App no responde, usa "Comprador" y "Sin teléfono".

### 5.3 Envío asignado a un fletero específico

```bash
curl -X PATCH http://localhost:3000/api/shipping/shipments/{shipment_id}/assign \
  -H "Content-Type: application/json" \
  -d '{
    "logistics_id": "usr_mock"
  }'
```

---

## 6. Obtener ruta de un envío

> Endpoint con 3 niveles de optimización:
> 1. Si `route_geometry` existe → devuelve directo (0 ORS)
> 2. Si solo coordenadas existen → solo routing (1 ORS)
> 3. Si no hay nada → geocoding + routing (3 ORS, legacy)

```bash
curl http://localhost:3000/api/shipping/shipments/{shipment_id}/route
```

**Response esperado (200):**
```json
{
  "geometry": {
    "type": "LineString",
    "coordinates": [[-62.272, -38.719], [-62.268, -38.715], ...]
  },
  "summary": {
    "distance": 1234.5,
    "duration": 180.0
  },
  "waypoints": {
    "origin": { "lat": -38.719, "lng": -62.272 },
    "destination": { "lat": -38.715, "lng": -62.268 }
  }
}
```

---

## 7. Actualizar estado de envío

```bash
curl -X PATCH http://localhost:3000/api/shipping/shipments/{shipment_id}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_transit"
  }'
```

```bash
curl -X PATCH http://localhost:3000/api/shipping/shipments/{shipment_id}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "delivered"
  }'
```

---

## 8. Liberar reserva de cotización (si es necesario)

```bash
curl -X POST http://localhost:3000/api/shipping/quotes/release \
  -H "Content-Type: application/json" \
  -d '{
    "quote_id": "qte_...",
    "order_id": "ord_test123"
  }'
```

---

## Resumen del flujo completo

```
1. POST /api/shipping/rates          → Crear 3 tarifas
2. POST /api/shipping/quotes         → Cotizar envío
3. POST /api/shipping/quotes/reserve → Reservar cotización
4. POST /api/buyer/:buyer_id         → (Opcional) Obtener datos del buyer
5. POST /api/shipping/shipments      → Crear envío (usa Buyer API si faltan datos)
6. GET  /api/shipping/shipments/:id/route → Ver ruta en mapa
7. PATCH /api/shipping/shipments/:id/status → Actualizar estado
```
