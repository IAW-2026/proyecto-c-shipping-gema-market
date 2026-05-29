import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { reserveQuoteSchema } from "@/lib/schemas/api/quote";
import { reserveQuote } from "@/lib/features/quote";

/**
 * POST /api/shipping/quotes/reserve
 * Consumido por: Payments App
 * Reserva una cotización para una orden, evitando que sea utilizada por otra.
 */
export async function POST(request: NextRequest) {
    if (!validateApiKey(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const parsed = reserveQuoteSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { quote_id, order_id } = parsed.data;
        const result = await reserveQuote(quote_id, order_id);

        return NextResponse.json({ ok: true, reserved_until: result.reserved_until }, { status: 200 });

    } catch (error) {
        const err = error as Error & { statusCode?: number; code?: string };
        console.error("[RESERVAR] Error:", err.message);

        if (err.statusCode) {
            return NextResponse.json({ error: err.message }, { status: err.statusCode });
        }

        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
