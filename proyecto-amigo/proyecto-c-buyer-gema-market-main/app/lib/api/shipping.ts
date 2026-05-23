/**
 * Cliente HTTP de la Shipping App (Layer 4 — External APIs).
 *
 * En desarrollo apunta a los route handlers locales de Next.js (/api/shipping/*).
 * En producción se reemplaza con la variable de entorno SHIPPING_API_URL.
 *
 * @see docs/apis.md — Shipping App endpoints
 */

import type {
  RequestQuoteParams,
  ShippingQuote,
} from "@/app/lib/types/api/shipping";
import { hashApiKey } from "@/app/lib/utils/hmac";

export type { RequestQuoteParams, ShippingQuote };

if (!process.env.SHIPPING_API_URL)
  throw new Error("Missing required environment variable: SHIPPING_API_URL");
if (!process.env.INTERNAL_API_KEY)
  throw new Error("Missing required environment variable: INTERNAL_API_KEY");

const SHIPPING_BASE_URL = process.env.SHIPPING_API_URL;
const API_KEY_HASH = hashApiKey(process.env.INTERNAL_API_KEY);

export async function requestShippingQuote(
  params: RequestQuoteParams,
): Promise<ShippingQuote> {
  const res = await fetch(`${SHIPPING_BASE_URL}/cotizaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key-hash": API_KEY_HASH },
    body: JSON.stringify(params),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Shipping API error: ${res.status}`);
  return res.json();
}
