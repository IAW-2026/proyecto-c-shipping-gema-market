import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

interface RouteParams {
    params: Promise<{ order_id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { order_id } = await params;

        const envio = await prisma.envio.findUnique({
            where: { order_id },
            select: {
                id: true,
                order_id: true,
                status: true,
                tracking_code: true,
                pickup_address: true,
                delivery_address: true,
                price: true,
                picked_up_at: true,
                delivered_at: true,
            },
        });

        if (!envio) {
            return NextResponse.json(
                { error: "Envío no encontrado" },
                { status: 404 }
            );
        }

        const origin = new URL(request.url).origin;

        return NextResponse.json({
            shipping_id: envio.id,
            order_id: envio.order_id,
            status: envio.status,
            tracking_code: envio.tracking_code,
            tracking_url: `${origin}/track/${envio.tracking_code}`,
            pickup_address: envio.pickup_address,
            delivery_address: envio.delivery_address,
            price: Number(envio.price),
            picked_up_at: envio.picked_up_at?.toISOString() ?? null,
            delivered_at: envio.delivered_at?.toISOString() ?? null,
        });
    } catch (error) {
        console.error("[ENVIOS_API] Error:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
