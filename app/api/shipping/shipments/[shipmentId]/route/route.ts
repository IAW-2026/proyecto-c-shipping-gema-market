import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCoordinatesFromAddress, getRoute } from "@/lib/services/open-route";

interface RouteParams {
    params: Promise<{ shipmentId: string }>;
}

type AddressWithCity = { street: string; number: string; city?: string | null; zip?: string | null };

function makeWaypoints(origin: [number, number], destination: [number, number]) {
    return {
        origin: { lat: origin[1], lng: origin[0] },
        destination: { lat: destination[1], lng: destination[0] },
    };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { shipmentId } = await params;

        const envio = await prisma.envio.findUnique({
            where: { id: shipmentId },
            select: {
                pickup_address: true,
                delivery_address: true,
                pickup_lat: true,
                pickup_lng: true,
                delivery_lat: true,
                delivery_lng: true,
                route_geometry: true,
                route_distance: true,
                route_duration: true,
            },
        });

        if (!envio) {
            return NextResponse.json(
                { error: "Envío no encontrado" },
                { status: 404 }
            );
        }

        // Nivel 1: ruta completa almacenada — 0 llamadas ORS
        if (envio.route_geometry) {
            return NextResponse.json({
                geometry: envio.route_geometry,
                summary: {
                    distance: envio.route_distance,
                    duration: envio.route_duration,
                },
                waypoints: makeWaypoints(
                    [envio.pickup_lng!, envio.pickup_lat!],
                    [envio.delivery_lng!, envio.delivery_lat!]
                ),
            });
        }

        // Nivel 2: solo coordenadas almacenadas — 1 llamada ORS (routing)
        if (envio.pickup_lat != null && envio.pickup_lng != null &&
            envio.delivery_lat != null && envio.delivery_lng != null) {
            const origin: [number, number] = [envio.pickup_lng, envio.pickup_lat];
            const dest: [number, number] = [envio.delivery_lng, envio.delivery_lat];

            const route = await getRoute(origin, dest);

            return NextResponse.json({
                geometry: route.geometry,
                summary: route.summary,
                waypoints: makeWaypoints(origin, dest),
            });
        }

        // Nivel 3: legacy — geocoding + routing (3 llamadas ORS)
        const pickupAddr = envio.pickup_address as AddressWithCity;
        const deliveryAddr = envio.delivery_address as AddressWithCity;

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
            waypoints: makeWaypoints(originCoords, destCoords),
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
