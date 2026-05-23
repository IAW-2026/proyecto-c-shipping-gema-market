/**
 * Datos mock compartidos por los route handlers de /api/payments/*.
 * Simula las respuestas de la Payments App real (Mercado Pago).
 * Cuando la Payments App real esté disponible, estos archivos simplemente se eliminan.
 *
 * @see docs/apis.md — Payments App endpoints
 */

import { generateUlid } from "@/app/lib/utils/ulidGenerator";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type MockPaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type MockPaymentOrder = {
  payment_id: string;
  buyer_id: string;
  orders: Array<{
    order_id: string;
    seller_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    quote_id?: string;
    shipping_price: number;
    amount: number;
  }>;
  total_amount: number;
  currency: string;
  status: MockPaymentStatus;
  return_url: string;
  created_at: string;
  checkout_url: string;
};

// ── Store en memoria de órdenes de pago (simula BD de Payments App) ──────────
// Map en memoria: payment_id → MockPaymentOrder
export const PAYMENT_STORE = new Map<string, MockPaymentOrder>();

/**
 * Crea y almacena una nueva orden de pago mock.
 * checkout_url apunta a la página de callback con status=approved para simular
 * un pago exitoso sin necesidad de Mercado Pago real.
 */
export function createMockPaymentOrder(params: {
  buyer_id: string;
  orders: MockPaymentOrder["orders"];
  currency: string;
  return_url: string;
}): MockPaymentOrder {
  const payment_id = generateUlid("pay");
  const total_amount = params.orders.reduce((sum, o) => sum + o.amount, 0);

  // En producción checkout_url sería la URL de Mercado Pago.
  // En mock apunta a /orders, simulando que Payments App redirige al buyer
  // de vuelta al historial de órdenes tras el pago.
  const checkout_url = "/orders";

  const paymentOrder: MockPaymentOrder = {
    payment_id,
    buyer_id: params.buyer_id,
    orders: params.orders,
    total_amount,
    currency: params.currency,
    status: "pending",
    return_url: params.return_url,
    created_at: new Date().toISOString(),
    checkout_url,
  };

  PAYMENT_STORE.set(payment_id, paymentOrder);
  return paymentOrder;
}
