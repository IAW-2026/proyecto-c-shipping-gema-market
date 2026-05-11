import { NextRequest, NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/validations/api-schemas";

/**
 * Endpoint para cotización de envíos.
 * Invocado por Buyer/Seller App para calcular costos antes de la compra.
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

        // TODO: Lógica de cálculo real (Etapa 3)
        // Por ahora devolvemos un cálculo mock basado en el peso
        const basePrice = 1500;
        const weightPrice = parsed.data.weight_kg * 500;
        const totalPrice = basePrice + weightPrice;

        return NextResponse.json({
            success: true,
            data: {
                price: totalPrice,
                currency: "ARS",
                estimated_days: 3,
                provider: "UniHousing Shipping"
            }
        });

    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
