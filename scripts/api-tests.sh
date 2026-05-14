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

# ============================================================
# 1. Cotización — Buyer App → Shipping App
# ============================================================
echo ""
bold "══════════════════════════════════════════════"
bold "  FASE 1: Cotización de Envío (Buyer → Shipping)"
bold "══════════════════════════════════════════════"

COTIZACION_RESP=$(curl -s -X POST "$BASE_URL/api/shipping/cotizaciones" \
    -H "Content-Type: application/json" \
    -d '{
        "destination_address": { "street": "Av. San Martín", "zip": "8000" },
        "product_id": "prd_01HXYZ1234567890ABCDEF",
        "weight_kg": 15,
        "height_m": 0.8,
        "width_m": 1.0,
        "depth_m": 0.5
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
    post "/api/shipping/cotizaciones/reservar" \
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
    post "/api/shipping/cotizaciones/liberar-reserva" \
        "Liberar reserva de cotización" \
        "{\"quote_id\": \"$QUOTE_ID\", \"order_id\": \"$ORDER_ID\"}"

    # Volver a reservar para el test de envío
    echo ""
    bold "  (Re-reservando para test de envío...)"
    curl -s -X POST "$BASE_URL/api/shipping/cotizaciones/reservar" \
        -H "Content-Type: application/json" \
        -d "{\"quote_id\": \"$QUOTE_ID\", \"order_id\": \"$ORDER_ID\"}" > /dev/null 2>&1 || true
fi

# ============================================================
# 4. Crear Envío — Seller App → Shipping App
# ============================================================
echo ""
bold "══════════════════════════════════════════════"
bold "  FASE 4: Crear Envío (Seller → Shipping)"
bold "══════════════════════════════════════════════"

post "/api/shipping/envios" \
    "Crear envío para orden" \
    "{\"order_id\": \"$ORDER_ID\", \"seller_id\": \"usr_01HXYZSELLER123456789\", \"buyer_id\": \"usr_01HXYZBUYER123456789\"}"

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
