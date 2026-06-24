import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { createShipmentSchema } from "@/lib/schemas/api/shipment";
import { createShipment } from "@/lib/features/shipment/shipment.service";
import { fetchAndPersistRouteGeometry } from "@/lib/clients/maps";
import { logIncomingRequest, logIncomingResponse } from "@/lib/utils/api-logger";

/**
 * POST /api/shipping/envios
 * Consumido por: Seller App (tras pago confirmado)
 * Solicita la creación y gestión logística de un envío para una orden específica.
 */
export async function POST(request: NextRequest) {
    const start = Date.now();
    const endpoint = "POST /api/shipping/envios";

    if (!validateApiKey(request)) {
        logIncomingResponse(endpoint, 401, { error: "Unauthorized" }, Date.now() - start);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        logIncomingRequest(endpoint, "POST", body);

        const parsed = createShipmentSchema.safeParse(body);
        if (!parsed.success) {
            const response = {
                error: "Datos inválidos",
                details: parsed.error.flatten().fieldErrors,
            };
            logIncomingResponse(endpoint, 400, response, Date.now() - start);
            return NextResponse.json(response, { status: 400 });
        }

        const result = await createShipment(parsed.data);

        await fetchAndPersistRouteGeometry(result.shipping_id);

        logIncomingResponse(endpoint, 201, result, Date.now() - start);
        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        const err = error as Error & { statusCode?: number; code?: string };
        console.error("[ENVIOS] Error:", err.message);

        if (err.statusCode) {
            const response = { error: err.message };
            logIncomingResponse(endpoint, err.statusCode, response, Date.now() - start);
            return NextResponse.json(response, { status: err.statusCode });
        }

        const response = { error: "Error interno del servidor" };
        logIncomingResponse(endpoint, 500, response, Date.now() - start);
        return NextResponse.json(response, { status: 500 });
    }
}
