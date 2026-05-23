/**
 * Tipos de la Shipping App según la documentación.
 * @see docs/apis.md — POST /api/shipping/cotizaciones
 *
 * Convención: todos los campos en snake_case (per docs/apis.md).
 */

import type { Address } from "@/app/lib/types/user";

// ── Request: POST /api/shipping/cotizaciones ──────────────────────────────────
export interface RequestQuoteParams {
  destination_address: Address;
  product_id: string;
  weight_kg: number;
  height_m: number;
  width_m: number;
  depth_m: number;
}

// ── Response: POST /api/shipping/cotizaciones ─────────────────────────────────
/**
 * Cotización de envío retornada por la Shipping App.
 * `valid_until` es ISO 8601; tras esa fecha el quote_id deja de ser válido.
 */
export interface ShippingQuote {
  quote_id: string;
  price: number;
  currency: string;
  estimated_days: number;
  valid_until: string;
}
