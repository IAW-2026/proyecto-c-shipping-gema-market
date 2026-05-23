/**
 * Cliente HTTP de la Payments App (Layer 4 — External APIs).
 *
 * En desarrollo apunta a los route handlers locales de Next.js (/api/payments/*).
 * En producción se reemplaza con la variable de entorno PAYMENTS_API_URL.
 *
 * @see docs/apis.md — Payments App endpoints
 */

import type {
  PaymentOrderItem,
  CreatePaymentOrderParams,
  PaymentOrderResult,
} from "@/app/lib/types/api/payments";
import { hashApiKey } from "@/app/lib/utils/hmac";

export type { PaymentOrderItem, CreatePaymentOrderParams, PaymentOrderResult };

if (!process.env.PAYMENTS_API_URL)
  throw new Error("Missing required environment variable: PAYMENTS_API_URL");
if (!process.env.INTERNAL_API_KEY)
  throw new Error("Missing required environment variable: INTERNAL_API_KEY");

const PAYMENTS_BASE_URL = process.env.PAYMENTS_API_URL;

export async function createPaymentOrder(
  params: CreatePaymentOrderParams,
): Promise<PaymentOrderResult> {
  const body = JSON.stringify({
    buyer_id: params.buyer_id,
    buyer_name: params.buyer_name,
    orders: params.orders,
    currency: params.currency ?? "ARS",
    return_url: params.return_url,
  });

  const res = await fetch(`${PAYMENTS_BASE_URL}/ordenes-de-pago`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key-hash": hashApiKey(process.env.INTERNAL_API_KEY!),
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Payments API error: ${res.status}`);
  return res.json();
}
