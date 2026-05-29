import prisma from "@/lib/db/prisma";
import { cacheLife } from "next/cache";

export interface ShipmentRouteData {
    pickup_address: unknown;
    delivery_address: unknown;
    pickup_lat: number | null;
    pickup_lng: number | null;
    delivery_lat: number | null;
    delivery_lng: number | null;
    route_geometry: unknown;
    route_distance: unknown;
    route_duration: unknown;
}

const routeSelect = {
    pickup_address: true,
    delivery_address: true,
    pickup_lat: true,
    pickup_lng: true,
    delivery_lat: true,
    delivery_lng: true,
    route_geometry: true,
    route_distance: true,
    route_duration: true,
} as const;

export async function getShipmentRouteData(shipmentId: string): Promise<ShipmentRouteData | null> {
    "use cache";
    cacheLife("minutes");

    const shipment = await prisma.shipment.findUnique({
        where: { id: shipmentId },
        select: routeSelect,
    });

    if (!shipment) return null;

    return {
        pickup_address: shipment.pickup_address,
        delivery_address: shipment.delivery_address,
        pickup_lat: shipment.pickup_lat,
        pickup_lng: shipment.pickup_lng,
        delivery_lat: shipment.delivery_lat,
        delivery_lng: shipment.delivery_lng,
        route_geometry: shipment.route_geometry,
        route_distance: shipment.route_distance,
        route_duration: shipment.route_duration,
    };
}
