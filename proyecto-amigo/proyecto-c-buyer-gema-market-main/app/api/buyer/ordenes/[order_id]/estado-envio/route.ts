import { NextRequest, NextResponse } from "next/server";
import { updateOrden } from "@/app/lib/db/orden";
import {
  ShippingStatusUpdateSchema,
  type ShippingStatusUpdateInput,
} from "@/app/lib/schemas/shipping";
import type { OrdenStatus } from "@prisma/client";
import { validateApiKey } from "@/app/lib/utils/hmac";


const SHIPPING_TO_ORDER_STATUS: Partial<
  Record<ShippingStatusUpdateInput["status"], OrdenStatus>
> = {
  in_transit: "shipping",
  delivered: "delivered",
  failed: "shipping_failed",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ order_id: string }> },
) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { order_id } = await params;
    const parsed = ShippingStatusUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      console.warn(
        "[POST /api/buyer/ordenes/estado-envio] body inválido:",
        parsed.error.issues,
      );
      return NextResponse.json(
        { error: "Body inválido", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { shipping_id, status } = parsed.data;
    const ordenStatus = SHIPPING_TO_ORDER_STATUS[status];

    if (ordenStatus) {
      await updateOrden(order_id, {
        status: ordenStatus,
        shippingId: shipping_id,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "[POST /api/buyer/ordenes/estado-envio] Error:",
      error,
    );
    return NextResponse.json(
      { error: "Error al procesar actualización de envío" },
      { status: 500 },
    );
  }
}
