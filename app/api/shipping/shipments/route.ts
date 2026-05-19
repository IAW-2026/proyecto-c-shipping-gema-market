import { NextRequest, NextResponse } from "next/server";
import { createShipmentSchema } from "@/lib/validations/api-schemas";
import { createShipment } from "@/lib/services/shipment";
import { fetchAndPersistRouteGeometry } from "@/lib/services/map-services";

/**
 * POST /api/shipping/shipments
 * Consumido por: Seller App (tras pago confirmado)
 * Solicita la creación y gestión logística de un envío para una orden específica.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const parsed = createShipmentSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Datos inválidos",
                    details: parsed.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const result = await createShipment(parsed.data, request);

        await fetchAndPersistRouteGeometry(result.shipping_id);

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        const err = error as Error & { statusCode?: number; code?: string };
        console.error("[ENVIOS] Error:", err.message);

        if (err.statusCode) {
            return NextResponse.json({ error: err.message }, { status: err.statusCode });
        }

        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
