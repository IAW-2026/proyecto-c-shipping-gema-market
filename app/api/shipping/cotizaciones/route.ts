import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { quoteRequestSchema } from "@/lib/schemas/api/quote";
import { calculateQuote } from "@/lib/features/quote";
import { logIncomingRequest, logIncomingResponse } from "@/lib/utils/api-logger";

/**
 * POST /api/shipping/cotizaciones
 * Consumido por: Buyer App
 * Calcula el costo y tiempo estimado de envío logístico entre dos domicilios.
 */
export async function POST(request: NextRequest) {
    const start = Date.now();
    const endpoint = "POST /api/shipping/cotizaciones";

    if (!validateApiKey(request)) {
        logIncomingResponse(endpoint, 401, { error: "Unauthorized" }, Date.now() - start);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        logIncomingRequest(endpoint, "POST", body);

        const parsed = quoteRequestSchema.safeParse(body);

        if (!parsed.success) {
            const response = { error: "Datos de cotización inválidos", details: parsed.error.flatten() };
            logIncomingResponse(endpoint, 400, response, Date.now() - start);
            return NextResponse.json(response, { status: 400 });
        }

        const result = await calculateQuote(parsed.data);

        logIncomingResponse(endpoint, 200, result, Date.now() - start);
        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        const err = error as Error & { statusCode?: number; code?: string };
        console.error("[COTIZACIONES] Error:", err.message);
        console.error("[COTIZACIONES] Stack:", err.stack);

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
