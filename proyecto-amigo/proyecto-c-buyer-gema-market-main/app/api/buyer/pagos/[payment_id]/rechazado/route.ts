import { NextRequest, NextResponse } from "next/server";
import { updateOrden } from "@/app/lib/db/orden";
import { PaymentRejectedSchema } from "@/app/lib/schemas/payments";
import { validateApiKey } from "@/app/lib/utils/hmac";

/**
 * POST /api/buyer/pagos/:payment_id/rechazado
 * Consumido por: Payments App.
 * Notifica rechazo/cancelación del pago para liberar las órdenes incluidas.
 *
 * @see docs/apis.md — POST /api/buyer/pagos/:payment_id/rechazado
 */
export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = PaymentRejectedSchema.safeParse(await req.json());
    if (!parsed.success) {
      console.warn(
        "[POST /api/buyer/pagos/rechazado] body inválido:",
        parsed.error.issues,
      );
      return NextResponse.json(
        { error: "Body inválido", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { orders } = parsed.data;

    await Promise.all(
      orders.map((o) => updateOrden(o.order_id, { status: "cancelled" })),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/buyer/pagos/rechazado] Error:", error);
    return NextResponse.json(
      { error: "Error al procesar rechazo de pago" },
      { status: 500 },
    );
  }
}
