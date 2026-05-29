import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { getShipmentByOrderId } from "@/lib/db/queries/public/shipment-by-order";

interface RouteParams {
    params: Promise<{ order_id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    if (!validateApiKey(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { order_id } = await params;

        const shipment = await getShipmentByOrderId(order_id);

        if (!shipment) {
            return NextResponse.json(
                { error: "Envío no encontrado" },
                { status: 404 }
            );
        }

        const origin = new URL(request.url).origin;

        return NextResponse.json({
            shipping_id: shipment.id,
            order_id: shipment.order_id,
            status: shipment.status,
            tracking_code: shipment.tracking_code,
            tracking_url: `${origin}/track/${shipment.tracking_code}`,
            pickup_address: shipment.pickup_address,
            delivery_address: shipment.delivery_address,
            price: shipment.price,
            picked_up_at: shipment.picked_up_at?.toISOString() ?? null,
            delivered_at: shipment.delivered_at?.toISOString() ?? null,
        });
    } catch (error) {
        console.error("[ENVIOS_API] Error:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
