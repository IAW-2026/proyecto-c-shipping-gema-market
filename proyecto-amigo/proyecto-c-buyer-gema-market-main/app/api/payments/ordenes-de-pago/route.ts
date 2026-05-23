import { NextRequest, NextResponse } from "next/server";
import { createMockPaymentOrder } from "@/app/mocks/payments/data";

/**
 * POST /api/payments/ordenes-de-pago
 * Simula la creación de una orden de pago en la Payments App.
 *
 * @see docs/apis.md — POST /api/payments/ordenes-de-pago
 *
 * Body esperado:
 * {
 *   buyer_id: string,
 *   buyer_name: string,
 *   orders: [{
 *     order_id, seller_id, product_id, quantity, unit_price,
 *     quote: { quote_id, shipping_price }
 *   }],
 *   currency: string,
 *   return_url: string
 * }
 *
 * Response 201:
 * {
 *   payment_id, checkout_url, status: "pending"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { buyer_id, buyer_name, orders, currency, return_url } = body;

    if (!buyer_id || !orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: "buyer_id y orders son requeridos" },
        { status: 400 },
      );
    }

    if (!buyer_name || typeof buyer_name !== "string") {
      return NextResponse.json(
        { error: "buyer_name es requerido" },
        { status: 400 },
      );
    }

    if (!return_url) {
      return NextResponse.json(
        { error: "return_url es requerido" },
        { status: 400 },
      );
    }

    // Mapear los orders al formato interno del mock
    const mappedOrders = orders.map(
      (o: {
        order_id: string;
        seller_id: string;
        product_id: string;
        quantity: number;
        unit_price: number;
        quote?: { quote_id?: string; shipping_price?: number };
      }) => ({
        order_id: o.order_id,
        seller_id: o.seller_id,
        product_id: o.product_id,
        quantity: o.quantity,
        unit_price: o.unit_price,
        quote_id: o.quote?.quote_id,
        shipping_price: o.quote?.shipping_price ?? 0,
        amount: o.unit_price * o.quantity + (o.quote?.shipping_price ?? 0),
      }),
    );

    const paymentOrder = createMockPaymentOrder({
      buyer_id,
      orders: mappedOrders,
      currency: currency ?? "ARS",
      return_url,
    });

    return NextResponse.json(
      {
        payment_id: paymentOrder.payment_id,
        checkout_url: paymentOrder.checkout_url,
        status: paymentOrder.status,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/payments/ordenes-de-pago] Error:", error);
    return NextResponse.json(
      { error: "Error al crear orden de pago" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/payments/ordenes-de-pago/:payment_id
 * (Manejado en /api/payments/ordenes-de-pago/[payment_id]/route.ts)
 */
