import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { getCoordinatesFromAddress, getRoute } from "@/lib/clients/maps";
import { getShipmentRouteData } from "@/lib/db/queries/public/shipment-route";
import type { ShipmentRouteData } from "@/lib/db/queries/public/shipment-route";

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
    if (!validateApiKey(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { shipmentId } = await params;

        const shipment = await getShipmentRouteData(shipmentId);

        if (!shipment) {
            return NextResponse.json(
                { error: "Envío no encontrado" },
                { status: 404 }
            );
        }

        // Nivel 1: ruta completa almacenada — 0 llamadas ORS
        if (shipment.route_geometry) {
            return NextResponse.json({
                geometry: shipment.route_geometry,
                summary: {
                    distance: shipment.route_distance,
                    duration: shipment.route_duration,
                },
                waypoints: makeWaypoints(
                    [shipment.pickup_lng!, shipment.pickup_lat!],
                    [shipment.delivery_lng!, shipment.delivery_lat!]
                ),
            });
        }

        // Nivel 2: solo coordenadas almacenadas — 1 llamada ORS (routing)
        if (shipment.pickup_lat != null && shipment.pickup_lng != null &&
            shipment.delivery_lat != null && shipment.delivery_lng != null) {
            const origin: [number, number] = [shipment.pickup_lng, shipment.pickup_lat];
            const dest: [number, number] = [shipment.delivery_lng, shipment.delivery_lat];

            const route = await getRoute(origin, dest);

            return NextResponse.json({
                geometry: route.geometry,
                summary: route.summary,
                waypoints: makeWaypoints(origin, dest),
            });
        }

        // Nivel 3: legacy — geocoding + routing (3 llamadas ORS)
        const pickupAddr = shipment.pickup_address as AddressWithCity;
        const deliveryAddr = shipment.delivery_address as AddressWithCity;

        const [originCoords, destCoords] = await Promise.all([
            getCoordinatesFromAddress(pickupAddr),
            getCoordinatesFromAddress(deliveryAddr),
        ]);

        if (!originCoords || !destCoords) {
            return NextResponse.json(
                { error: "No se pudieron geocodificar las direcciones" },
                { status: 400 }
            );
        }

        const route = await getRoute(originCoords.coordinates, destCoords.coordinates);

        return NextResponse.json({
            geometry: route.geometry,
            summary: route.summary,
            waypoints: makeWaypoints(originCoords.coordinates, destCoords.coordinates),
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
