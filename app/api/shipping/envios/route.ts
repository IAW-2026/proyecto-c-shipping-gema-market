import { NextRequest, NextResponse } from "next/server";
import { createShipmentSchema } from "@/lib/validations/api-schemas";

/**
 * Endpoint para la creación de envíos.
 * Invocado por Seller App cuando se concreta una venta.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // 1. Validación de contrato mediante Zod
        const parsed = createShipmentSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { 
                    error: "Contrato inválido", 
                    details: parsed.error.flatten().fieldErrors 
                },
                { status: 400 }
            );
        }

        // 2. TODO: Lógica de negocio (Etapa 3)
        // - Generar shippingId (ULID)
        // - Generar trackingCode
        // - Persistir en DB con estado 'pending_pickup'
        
        console.log("[API] Recibida solicitud de creación de envío para orden:", parsed.data.order_id);

        return NextResponse.json({
            success: true,
            data: {
                shippingId: `shp_${Math.random().toString(36).substr(2, 26)}`,
                trackingCode: `TRK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                status: "pending_pickup"
            }
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
