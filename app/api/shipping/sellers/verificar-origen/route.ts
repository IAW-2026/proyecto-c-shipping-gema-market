import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { z } from "zod";
import { getCoordinatesFromAddress } from "@/lib/services/map-services";

const verifySchema = z.object({
    product_id: z.string().min(1),
    street: z.string().min(1),
    number: z.string().min(1),
    zip: z.string().optional(),
});

export async function POST(request: NextRequest) {
    if (!validateApiKey(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const parsed = verifySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { valid: false, error: "Datos inválidos", code: "INVALID_INPUT" },
                { status: 422 }
            );
        }

        const { street, number, zip } = parsed.data;

        const result = await getCoordinatesFromAddress({ street, number, zip });

        if (!result) {
            return NextResponse.json(
                { valid: false, error: "La dirección no existe", code: "INVALID_ADDRESS" },
                { status: 422 }
            );
        }

        if (!result.displayName.includes("Bahía Blanca")) {
            return NextResponse.json(
                { valid: false, error: "La dirección está fuera de Bahía Blanca", code: "OUTSIDE_COVERAGE" },
                { status: 422 }
            );
        }

        return NextResponse.json({ valid: true, in_coverage_area: true }, { status: 200 });

    } catch (error) {
        console.error("[VERIFICAR-ORIGEN] Error:", error);
        return NextResponse.json(
            { valid: false, error: "Error interno del servidor", code: "INTERNAL_ERROR" },
            { status: 500 }
        );
    }
}
