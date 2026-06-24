import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { releaseQuoteSchema } from "@/lib/schemas/api/quote";
import { releaseQuote } from "@/lib/features/quote";
import { logIncomingRequest, logIncomingResponse } from "@/lib/utils/api-logger";

/**
 * POST /api/shipping/cotizaciones/liberar-reserva
 * Consumido por: Payments App
 * Libera la reserva de una cotización, dejándola disponible nuevamente.
 */
export async function POST(request: NextRequest) {
    const start = Date.now();
    const endpoint = "POST /api/shipping/cotizaciones/liberar-reserva";

    if (!validateApiKey(request)) {
        logIncomingResponse(endpoint, 401, { error: "Unauthorized" }, Date.now() - start);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        logIncomingRequest(endpoint, "POST", body);

        const parsed = releaseQuoteSchema.safeParse(body);

        if (!parsed.success) {
            const response = { error: "Datos inválidos", details: parsed.error.flatten() };
            logIncomingResponse(endpoint, 400, response, Date.now() - start);
            return NextResponse.json(response, { status: 400 });
        }

        const { quote_id, order_id } = parsed.data;
        await releaseQuote(quote_id, order_id);

        const response = { ok: true };
        logIncomingResponse(endpoint, 200, response, Date.now() - start);
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        const err = error as Error & { statusCode?: number; code?: string };
        console.error("[LIBERAR RESERVA] Error:", err.message);

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
