import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { logIncomingResponse } from "@/lib/utils/api-logger";
import { getAdminShipmentById } from "@/lib/db/queries/admin/shipments";
import { updateShipmentLogistics } from "@/lib/db/mutations/admin/shipments";
import { AdminPatchShipmentBodySchema } from "@/lib/schemas/api/admin";

interface RouteParams {
    params: Promise<{ shipping_id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const start = Date.now();
    const endpoint = "GET /api/shipping/admin/envios/{shipping_id}";

    if (!validateApiKey(request)) {
        logIncomingResponse(endpoint, 401, { error: "Unauthorized" }, Date.now() - start);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { shipping_id } = await params;
        const shipment = await getAdminShipmentById(shipping_id);

        if (!shipment) {
            const response = { error: "Envío no encontrado" };
            logIncomingResponse(endpoint, 404, response, Date.now() - start);
            return NextResponse.json(response, { status: 404 });
        }

        logIncomingResponse(endpoint, 200, shipment, Date.now() - start);
        return NextResponse.json(shipment);
    } catch (error) {
        console.error("[ADMIN_ENVIOS_DETAIL] Error:", error);
        const response = { error: "Error interno del servidor" };
        logIncomingResponse(endpoint, 500, response, Date.now() - start);
        return NextResponse.json(response, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const start = Date.now();
    const endpoint = "PATCH /api/shipping/admin/envios/{shipping_id}";

    if (!validateApiKey(request)) {
        logIncomingResponse(endpoint, 401, { error: "Unauthorized" }, Date.now() - start);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { shipping_id } = await params;
        const body = await request.json();
        const parsed = AdminPatchShipmentBodySchema.safeParse(body);

        if (!parsed.success) {
            const response = { error: "Invalid body", details: parsed.error.flatten() };
            logIncomingResponse(endpoint, 400, response, Date.now() - start);
            return NextResponse.json(response, { status: 400 });
        }

        const { logistics_id } = parsed.data;
        const result = await updateShipmentLogistics(shipping_id, logistics_id ?? null);

        if ("error" in result) {
            const status = result.error === "NOT_FOUND" ? 404 : 422;
            const response = { error: result.message };
            logIncomingResponse(endpoint, status, response, Date.now() - start);
            return NextResponse.json(response, { status });
        }

        const response = {
            shipping_id: result.shipment.id,
            status: result.shipment.status,
            logistics_id: result.shipment.logistics_id,
        };

        logIncomingResponse(endpoint, 200, response, Date.now() - start);
        return NextResponse.json(response);
    } catch (error) {
        console.error("[ADMIN_ENVIOS_PATCH] Error:", error);
        const response = { error: "Error interno del servidor" };
        logIncomingResponse(endpoint, 500, response, Date.now() - start);
        return NextResponse.json(response, { status: 500 });
    }
}
