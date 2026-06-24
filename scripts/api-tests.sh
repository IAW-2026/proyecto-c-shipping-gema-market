#!/usr/bin/env bash
# ============================================================
# API Tests — Shipping App
# Simula peticiones desde Buyer App, Seller App y Payments App
# Uso: bash scripts/api-tests.sh [BASE_URL]
# Ej:  bash scripts/api-tests.sh http://localhost:3000
# ============================================================
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
PASS=0
FAIL=0

green() { echo -e "\033[32m$1\033[0m"; }
red()   { echo -e "\033[31m$1\033[0m"; }
bold()  { echo -e "\033[1m$1\033[0m"; }

# Helper: POST con JSON
post() {
    local url="$1" desc="$2" body="$3"
    echo ""
    bold "▸ $desc"
    echo "  POST $url"
    echo "  Body: $(echo "$body" | jq -c . 2>/dev/null || echo "$body")"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$url" \
        -H "Content-Type: application/json" \
        -d "$body" 2>/dev/null || true)

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        green "  ✓ HTTP $HTTP_CODE"
        PASS=$((PASS + 1))
    else
        red "  ✗ HTTP $HTTP_CODE"
        FAIL=$((FAIL + 1))
    fi
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
}

# Helper: POST con JSON + API key
post_api_key() {
    local url="$1" desc="$2" body="$3"
    echo ""
    bold "▸ $desc"
    echo "  POST $url"
    echo "  Body: $(echo "$body" | jq -c . 2>/dev/null || echo "$body")"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$url" \
        -H "Content-Type: application/json" \
        -H "x-api-key-hash: $API_KEY_HASH" \
        -d "$body" 2>/dev/null || true)

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        green "  ✓ HTTP $HTTP_CODE"
        PASS=$((PASS + 1))
    else
        red "  ✗ HTTP $HTTP_CODE"
        FAIL=$((FAIL + 1))
    fi
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
}

# Helper: GET con API key
get_admin() {
    local url="$1" desc="$2"
    echo ""
    bold "▸ $desc"
    echo "  GET $url"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$url" \
        -H "x-api-key-hash: ${ADMIN_API_KEY_HASH:-invalid}" 2>/dev/null || true)

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        green "  ✓ HTTP $HTTP_CODE"
        PASS=$((PASS + 1))
    else
        red "  ✗ HTTP $HTTP_CODE"
        FAIL=$((FAIL + 1))
    fi
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
}

# Helper: PATCH con API key
patch_admin() {
    local url="$1" desc="$2" body="$3"
    echo ""
    bold "▸ $desc"
    echo "  PATCH $url"
    echo "  Body: $(echo "$body" | jq -c . 2>/dev/null || echo "$body")"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL$url" \
        -H "Content-Type: application/json" \
        -H "x-api-key-hash: ${ADMIN_API_KEY_HASH:-invalid}" \
        -d "$body" 2>/dev/null || true)

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        green "  ✓ HTTP $HTTP_CODE"
        PASS=$((PASS + 1))
    else
        red "  ✗ HTTP $HTTP_CODE"
        FAIL=$((FAIL + 1))
    fi
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
}

# ============================================================
# 1. Cotización — Buyer App → Shipping App
# ============================================================
echo ""
bold "══════════════════════════════════════════════"
bold "  FASE 1: Cotización de Envío (Buyer → Shipping)"
bold "══════════════════════════════════════════════"

API_KEY="${API_KEY:-d6540fb085ce11ad9cf9f180e7fa9a6d27189309631b21b14a62f2a54b5332f1}"
API_KEY_HASH=$(echo -n "$API_KEY" | sha256sum | awk '{print $1}' | tr '[:lower:]' '[:upper:]')

COTIZACION_RESP=$(curl -s -X POST "$BASE_URL/api/shipping/cotizaciones" \
    -H "Content-Type: application/json" \
    -H "x-api-key-hash: $API_KEY_HASH" \
    -d '{
        "destination_address": { "street": "Av. San Martín", "zip": "8000" },
        "product_id": "prd_01HXYZ1234567890ABCDEF",
        "weight_kg": 15,
        "height_cm": 80,
        "width_cm": 100,
        "depth_cm": 50
    }' 2>/dev/null || echo '{"error":"fallback"}')

QUOTE_ID=$(echo "$COTIZACION_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('quote_id',''))" 2>/dev/null || echo "")
HTTP_COT=$(echo "$COTIZACION_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('quote_id',''))" 2>/dev/null || echo "")

if [ -n "$QUOTE_ID" ]; then
    green "  ✓ Cotización creada: $QUOTE_ID"
    PASS=$((PASS + 1))
    echo "$COTIZACION_RESP" | python3 -m json.tool 2>/dev/null
else
    red "  ✗ Falló creación de cotización"
    FAIL=$((FAIL + 1))
    echo "$COTIZACION_RESP" | python3 -m json.tool 2>/dev/null || echo "$COTIZACION_RESP"
fi

ORDER_ID="ord_test_$(date +%s)"

# ============================================================
# 2. Reservar Cotización — Payments App → Shipping App
# ============================================================
echo ""
bold "══════════════════════════════════════════════"
bold "  FASE 2: Reservar Cotización (Payments → Shipping)"
bold "══════════════════════════════════════════════"

if [ -n "$QUOTE_ID" ]; then
    post_api_key "/api/shipping/cotizaciones/reservar" \
        "Reservar cotización para orden" \
        "{\"quote_id\": \"$QUOTE_ID\", \"order_id\": \"$ORDER_ID\"}"
else
    red "  ✗ No hay quote_id, se saltea este test"
    FAIL=$((FAIL + 1))
fi

# ============================================================
# 3. Liberar Reserva — Payments App → Shipping App
# ============================================================
echo ""
bold "══════════════════════════════════════════════"
bold "  FASE 3: Liberar Reserva (Payments → Shipping)"
bold "══════════════════════════════════════════════"

if [ -n "$QUOTE_ID" ]; then
    post_api_key "/api/shipping/cotizaciones/liberar-reserva" \
        "Liberar reserva de cotización" \
        "{\"quote_id\": \"$QUOTE_ID\", \"order_id\": \"$ORDER_ID\"}"

    # Volver a reservar para el test de envío
    echo ""
    bold "  (Re-reservando para test de envío...)"
    curl -s -X POST "$BASE_URL/api/shipping/cotizaciones/reservar" \
        -H "Content-Type: application/json" \
        -H "x-api-key-hash: $API_KEY_HASH" \
        -d "{\"quote_id\": \"$QUOTE_ID\", \"order_id\": \"$ORDER_ID\"}" > /dev/null 2>&1 || true
fi

# ============================================================
# 4. Crear Envío — Seller App → Shipping App
# ============================================================
echo ""
bold "══════════════════════════════════════════════"
bold "  FASE 4: Crear Envío (Seller → Shipping)"
bold "══════════════════════════════════════════════"

    post_api_key "/api/shipping/envios" \
    "Crear envío para orden" \
    "{\"order_id\": \"$ORDER_ID\", \"seller_id\": \"usr_01HXYZSELLER123456789\", \"buyer_id\": \"usr_01HXYZBUYER123456789\"}"

# ============================================================
# 5. Admin API — Control Plane / Analytics
# ============================================================
echo ""
bold "══════════════════════════════════════════════"
bold "  FASE 5: Admin API (Control Plane / Analytics)"
bold "══════════════════════════════════════════════"

# Test sin API key (debe fallar con 401)
echo ""
bold "▸ Admin envios — sin API key (esperado 401)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/shipping/admin/envios" 2>/dev/null || true)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "401" ]; then
    green "  ✓ HTTP 401 (Unauthorized correcto)"
    PASS=$((PASS + 1))
else
    red "  ✗ HTTP $HTTP_CODE (esperado 401)"
    FAIL=$((FAIL + 1))
fi

# Test con API key (listado de envios)
get_admin "/api/shipping/admin/envios?page=1&page_size=5" "Admin envios — listado paginado"

# Test con API key (stats)
get_admin "/api/shipping/admin/stats" "Admin stats — métricas agregadas"

# Test con API key (timeseries)
get_admin "/api/shipping/admin/stats/timeseries?date_from=2026-01-01T00:00:00Z&date_to=2026-12-31T23:59:59Z&granularity=month&metric=shipments" "Admin timeseries — serie mensual"

# Test con API key (drivers)
get_admin "/api/shipping/admin/drivers?page=1&page_size=5" "Admin drivers — listado de couriers"

# Test con API key (usuarios)
get_admin "/api/shipping/admin/usuarios?page=1&page_size=5" "Admin usuarios — cache local"

# ============================================================
# Resumen
# ============================================================
echo ""
bold "══════════════════════════════════════════════"
bold "  RESULTADOS"
bold "══════════════════════════════════════════════"
green "  ✓ Pasaron: $PASS"
if [ "$FAIL" -gt 0 ]; then
    red "  ✗ Fallaron: $FAIL"
else
    green "  ✓ Todos los tests pasaron"
fi
echo ""
