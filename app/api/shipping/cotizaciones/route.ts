import { NextRequest, NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/validations/api-schemas";
import { calculateQuote } from "@/lib/services/cotizacion.service";
import { createTraceIfDebug, withTrace } from "@/lib/shared/api-handler";

/**
 * POST /api/shipping/cotizaciones
 * Consumido por: Buyer App
 * Calcula el costo y tiempo estimado de envío logístico entre dos domicilios.
 */
export async function POST(request: NextRequest) {
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
        const result = await calculateQuote(parsed.data, trace);

        return NextResponse.json(withTrace(result, trace), { status: 200 });

    } catch (error) {
        console.error("[COTIZACIONES] Error:", error);
        const message = error instanceof Error ? error.message : "Error interno del servidor";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
