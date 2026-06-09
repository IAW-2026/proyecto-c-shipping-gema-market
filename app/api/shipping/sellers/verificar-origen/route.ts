import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { z } from "zod";
import { getCoordinatesFromAddress } from "@/lib/clients/maps";
import { logIncomingRequest, logIncomingResponse } from "@/lib/utils/api-logger";

const verifySchema = z.object({
    product_id: z.string().min(1),
    street: z.string().min(1),
    number: z.string().min(1),
    zip: z.string().optional(),
});

export async function POST(request: NextRequest) {
    const start = Date.now();
    const endpoint = "POST /api/shipping/sellers/verificar-origen";

    if (!validateApiKey(request)) {
        logIncomingResponse(endpoint, 401, { error: "Unauthorized" }, Date.now() - start);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        logIncomingRequest(endpoint, "POST", body);

        const parsed = verifySchema.safeParse(body);

        if (!parsed.success) {
            const response = { valid: false, error: "Datos inválidos", code: "INVALID_INPUT" };
            logIncomingResponse(endpoint, 400, response, Date.now() - start);
            return NextResponse.json(response, { status: 400 });
        }

        const { street, number, zip } = parsed.data;

        const result = await getCoordinatesFromAddress({ street, number, zip });

        if (!result) {
            const response = { valid: false, error: "La dirección no existe", code: "INVALID_ADDRESS" };
            logIncomingResponse(endpoint, 400, response, Date.now() - start);
            return NextResponse.json(response, { status: 400 });
        }

        if (!result.displayName.includes("Bahía Blanca")) {
            const response = { valid: false, error: "La dirección está fuera de Bahía Blanca", code: "OUTSIDE_COVERAGE" };
            logIncomingResponse(endpoint, 400, response, Date.now() - start);
            return NextResponse.json(response, { status: 400 });
        }

        const response = { valid: true, in_coverage_area: true };
        logIncomingResponse(endpoint, 200, response, Date.now() - start);
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("[VERIFICAR-ORIGEN] Error:", error);
        const response = { valid: false, error: "Error interno del servidor", code: "INTERNAL_ERROR" };
        logIncomingResponse(endpoint, 500, response, Date.now() - start);
        return NextResponse.json(response, { status: 500 });
    }
}
