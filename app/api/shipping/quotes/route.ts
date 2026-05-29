import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { quoteRequestSchema } from "@/lib/schemas/api/quote";
import { calculateQuote } from "@/lib/features/quote";
import { createTraceIfDebug, withTrace } from "@/lib/utils/api-handler";

/**
 * POST /api/shipping/quotes
 * Consumido por: Buyer App
 * Calcula el costo y tiempo estimado de envío logístico entre dos domicilios.
 */
export async function POST(request: NextRequest) {
    if (!validateApiKey(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const parsed = quoteRequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Datos de cotización inválidos", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const trace = createTraceIfDebug(request);
        const result = await calculateQuote(parsed.data, trace, request);

        return NextResponse.json(withTrace(result, trace), { status: 200 });

    } catch (error) {
        const err = error as Error & { statusCode?: number; code?: string };
        console.error("[COTIZACIONES] Error:", err.message);

        if (err.statusCode) {
            return NextResponse.json({ error: err.message }, { status: err.statusCode });
        }

        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
