import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { reserveQuoteSchema } from "@/lib/schemas/api/quote";
import { reserveQuote } from "@/lib/features/quote";
import { logIncomingRequest, logIncomingResponse } from "@/lib/utils/api-logger";

/**
 * POST /api/shipping/cotizaciones/reservar
 * Consumido por: Payments App
 * Reserva una cotización para una orden, evitando que sea utilizada por otra.
 */
export async function POST(request: NextRequest) {
    const start = Date.now();
    const endpoint = "POST /api/shipping/cotizaciones/reservar";

    if (!validateApiKey(request)) {
        logIncomingResponse(endpoint, 401, { error: "Unauthorized" }, Date.now() - start);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        logIncomingRequest(endpoint, "POST", body);

        const parsed = reserveQuoteSchema.safeParse(body);

        if (!parsed.success) {
            const response = { error: "Datos inválidos", details: parsed.error.flatten() };
            logIncomingResponse(endpoint, 400, response, Date.now() - start);
            return NextResponse.json(response, { status: 400 });
        }

        const { quote_id, order_id } = parsed.data;
        const result = await reserveQuote(quote_id, order_id);

        const response = { ok: true, reserved_until: result.reserved_until };
        logIncomingResponse(endpoint, 200, response, Date.now() - start);
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        const err = error as Error & { statusCode?: number; code?: string };
        console.error("[RESERVAR] Error:", err.message);

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
