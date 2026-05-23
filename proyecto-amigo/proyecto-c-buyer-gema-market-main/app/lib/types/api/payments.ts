/**
 * Tipos de la Payments App según la documentación.
 * @see docs/apis.md — POST /api/payments/ordenes-de-pago
 * @see docs/apis.md — GET  /api/payments/ordenes-de-pago/:payment_id
 *
 * Convención: todos los campos en snake_case (per docs/apis.md).
 */

// ── Estado de una orden de pago ──────────────────────────────────────────────
export type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled";

// ── Ítem de orden enviado a la Payments App ───────────────────────────────────
/**
 * Cada orden creada en la BD del buyer se traduce a este shape para que
 * Payments App calcule el total y arme el checkout.
 */
export interface PaymentOrderItem {
  order_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  quote?: {
    quote_id: string;
    shipping_price: number;
  };
}

// ── Request: POST /api/payments/ordenes-de-pago ───────────────────────────────
export interface CreatePaymentOrderParams {
  buyer_id: string;
  buyer_name: string;
  orders: PaymentOrderItem[];
  currency?: string;
  return_url: string;
}

// ── Response: POST /api/payments/ordenes-de-pago ──────────────────────────────
/**
 * Resultado de crear una orden de pago en la Payments App.
 * `checkout_url` es la URL a la que se redirige al buyer para pagar.
 */
export interface PaymentOrderResult {
  payment_id: string;
  checkout_url: string;
  status: PaymentStatus;
}
