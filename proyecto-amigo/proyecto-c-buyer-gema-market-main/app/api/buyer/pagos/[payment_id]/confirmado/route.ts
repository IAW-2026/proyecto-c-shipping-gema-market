import { NextRequest, NextResponse } from "next/server";
import { updateOrden } from "@/app/lib/db/orden";
import { PaymentConfirmedSchema } from "@/app/lib/schemas/payments";
import { validateApiKey } from "@/app/lib/utils/hmac";

/**
 * POST /api/buyer/pagos/:payment_id/confirmado
 * Consumido por: Payments App.
 * Notifica que el pago fue aprobado para las órdenes incluidas.
 *
 * @see docs/apis.md — POST /api/buyer/pagos/:payment_id/confirmado
 */
export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = PaymentConfirmedSchema.safeParse(await req.json());
    if (!parsed.success) {
      console.warn(
        "[POST /api/buyer/pagos/confirmado] body inválido:",
        parsed.error.issues,
      );
      return NextResponse.json(
        { error: "Body inválido", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { orders } = parsed.data;

    await Promise.all(
      orders.map((o) => updateOrden(o.order_id, { status: "paid" })),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/buyer/pagos/confirmado] Error:", error);
    return NextResponse.json(
      { error: "Error al procesar confirmación de pago" },
      { status: 500 },
    );
  }
}
