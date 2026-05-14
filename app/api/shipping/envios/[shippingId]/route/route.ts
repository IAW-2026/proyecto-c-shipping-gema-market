import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCoordinatesFromAddress, getRoute } from "@/lib/services/ors.service";

interface RouteParams {
    params: Promise<{ shippingId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { shippingId } = await params;

        const envio = await prisma.envio.findUnique({
            where: { id: shippingId },
            select: {
                pickup_address: true,
                delivery_address: true,
            },
        });

        if (!envio) {
            return NextResponse.json(
                { error: "Envío no encontrado" },
                { status: 404 }
            );
        }

        const pickupAddr = envio.pickup_address as { street: string; number: string; zip?: string | null };
        const deliveryAddr = envio.delivery_address as { street: string; number: string; zip?: string | null };

        const [originCoords, destCoords] = await Promise.all([
            getCoordinatesFromAddress(pickupAddr),
            getCoordinatesFromAddress(deliveryAddr),
        ]);

        if (!originCoords || !destCoords) {
            return NextResponse.json(
                { error: "No se pudieron geocodificar las direcciones" },
                { status: 422 }
            );
        }

        const route = await getRoute(originCoords, destCoords);

        return NextResponse.json({
            geometry: route.geometry,
            summary: route.summary,
            waypoints: {
                origin: { lat: originCoords[1], lng: originCoords[0] },
                destination: { lat: destCoords[1], lng: destCoords[0] },
            },
        });

    } catch (error) {
        const err = error as Error & { statusCode?: number; code?: string };
        console.error("[ROUTE] Error:", err.message);

        if (err.statusCode) {
            return NextResponse.json({ error: err.message }, { status: err.statusCode });
        }

        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
