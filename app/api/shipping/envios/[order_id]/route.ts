import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { getShipmentByOrderId } from "@/lib/db/queries/public/shipment-by-order";
import { logIncomingResponse } from "@/lib/utils/api-logger";

interface RouteParams {
    params: Promise<{ order_id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const start = Date.now();
    const endpoint = `GET /api/shipping/envios/{order_id}`;

    if (!validateApiKey(request)) {
        logIncomingResponse(endpoint, 401, { error: "Unauthorized" }, Date.now() - start);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { order_id } = await params;

        const shipment = await getShipmentByOrderId(order_id);

        if (!shipment) {
            const response = { error: "Envío no encontrado" };
            logIncomingResponse(endpoint, 404, response, Date.now() - start);
            return NextResponse.json(response, { status: 404 });
        }

        const origin = new URL(request.url).origin;

        const response = {
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
        };
        logIncomingResponse(endpoint, 200, response, Date.now() - start);
        return NextResponse.json(response);
    } catch (error) {
        console.error("[ENVIOS_API] Error:", error);
        const response = { error: "Error interno del servidor" };
        logIncomingResponse(endpoint, 500, response, Date.now() - start);
        return NextResponse.json(response, { status: 500 });
    }
}
