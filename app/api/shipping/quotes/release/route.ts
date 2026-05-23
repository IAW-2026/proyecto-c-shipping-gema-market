import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { releaseQuoteSchema } from "@/lib/validations/api-schemas";
import { releaseQuote } from "@/lib/services/quote";

/**
 * POST /api/shipping/quotes/release
 * Consumido por: Payments App
 * Libera la reserva de una cotización, dejándola disponible nuevamente.
 */
export async function POST(request: NextRequest) {
    if (!validateApiKey(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const parsed = releaseQuoteSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { quote_id, order_id } = parsed.data;
        await releaseQuote(quote_id, order_id);

        return NextResponse.json({ ok: true }, { status: 200 });

    } catch (error) {
        const err = error as Error & { statusCode?: number; code?: string };
        console.error("[LIBERAR RESERVA] Error:", err.message);

        if (err.statusCode) {
            return NextResponse.json({ error: err.message }, { status: err.statusCode });
        }

        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
