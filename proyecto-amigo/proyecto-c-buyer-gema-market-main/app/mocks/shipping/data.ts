/**
 * Datos mock compartidos por los route handlers de /api/shipping/*.
 * Simula las respuestas de la Shipping App real.
 * Cuando la Shipping App real esté disponible, estos archivos simplemente se eliminan.
 *
 * @see docs/apis.md — Shipping App endpoints
 */

import { generateUlid } from "@/app/lib/utils/ulidGenerator";

// ── Tarifa base por kg ────────────────────────────────────────────────────────
// Lógica simplificada de cotización: precio = BASE + peso * RATE_PER_KG
const BASE_PRICE = 1500; // ARS — fijo por gestión
const RATE_PER_KG = 250; // ARS por kg

/**
 * Calcula el precio de envío en base al peso en kg y dimensiones en metros.
 * Usa el peso equivalente: el mayor entre el peso real y el peso volumétrico.
 * (Peso volumétrico aprox = alto * ancho * profundo * 250)
 * Devuelve siempre un número entero para simplificar.
 */
export function calcShippingPrice(
  weight_kg: number,
  height_m: number = 0,
  width_m: number = 0,
  depth_m: number = 0,
): number {
  const volume_m3 = height_m * width_m * depth_m;
  const volumetric_weight = volume_m3 * 250;
  const effective_weight = Math.max(weight_kg, volumetric_weight);
  
  return Math.round(BASE_PRICE + effective_weight * RATE_PER_KG);
}

/**
 * Calcula los días estimados de entrega según el peso.
 * - < 5 kg  → 1-2 días
 * - 5-20 kg → 2-3 días
 * - > 20 kg → 3-5 días
 */
export function calcEstimatedDays(weight_kg: number): number {
  if (weight_kg < 5) return 2;
  if (weight_kg <= 20) return 3;
  return 5;
}

// ── Store en memoria de cotizaciones (simula BD de Shipping App) ──────────────
type MockQuote = {
  quote_id: string;
  product_id: string;
  price: number;
  currency: string;
  estimated_days: number;
  valid_until: string; // ISO string
  reserved_by?: string; // order_id que reservó la cotización
};

// Map en memoria: quote_id → MockQuote
// Nota: se reinicia con cada deploy en dev; suficiente para tests manuales
export const QUOTE_STORE = new Map<string, MockQuote>();

/**
 * Crea y almacena una nueva cotización mock.
 * valid_until = ahora + 30 minutos.
 */
export function createMockQuote(
  product_id: string,
  weight_kg: number,
  height_m: number = 0,
  width_m: number = 0,
  depth_m: number = 0,
): MockQuote {
  const quote_id = generateUlid("qte");
  const valid_until = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const quote: MockQuote = {
    quote_id,
    product_id,
    price: calcShippingPrice(weight_kg, height_m, width_m, depth_m),
    currency: "ARS",
    estimated_days: calcEstimatedDays(weight_kg),
    valid_until,
  };

  QUOTE_STORE.set(quote_id, quote);
  return quote;
}

// ── Store en memoria de envíos (simula BD de Shipping App) ───────────────────
export type MockEnvio = {
  shipping_id: string;
  order_id: string;
  status: "pending_pickup" | "in_transit" | "delivered" | "failed";
  tracking_code: string;
};

export const ENVIO_STORE = new Map<string, MockEnvio>(); // order_id → MockEnvio
