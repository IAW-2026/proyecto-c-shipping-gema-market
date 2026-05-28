import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export interface CreateShipmentData {
    id: string;
    order_id: string;
    quote_id: string;
    buyer_id: string;
    seller_id: string;
    receiver_name: string;
    receiver_phone: string;
    weight: number;
    dimensions: { width: number; height: number; depth: number };
    pickup_address: Prisma.InputJsonValue;
    delivery_address: Prisma.InputJsonValue;
    tracking_code: string;
    price: Prisma.Decimal | number;
    pickup_lat: number | null;
    pickup_lng: number | null;
    delivery_lat: number | null;
    delivery_lng: number | null;
    route_distance: number | null;
    route_duration: number | null;
}

export async function createShipmentRecord(data: CreateShipmentData, client: Prisma.TransactionClient | typeof prisma = prisma) {
    return client.shipment.create({
        data: {
            id: data.id,
            order_id: data.order_id,
            quote_id: data.quote_id,
            buyer_id: data.buyer_id,
            receiver_name: data.receiver_name,
            receiver_phone: data.receiver_phone,
            seller_id: data.seller_id,
            weight: data.weight,
            dimensions: data.dimensions,
            pickup_address: data.pickup_address,
            delivery_address: data.delivery_address,
            tracking_code: data.tracking_code,
            status: "waiting_for_courier",
            price: data.price,
            pickup_lat: data.pickup_lat,
            pickup_lng: data.pickup_lng,
            delivery_lat: data.delivery_lat,
            delivery_lng: data.delivery_lng,
            route_geometry: Prisma.DbNull,
            route_distance: data.route_distance,
            route_duration: data.route_duration,
        },
    });
}

export async function persistRouteGeometry(
    shipmentId: string,
    routeGeometry: Prisma.InputJsonValue
): Promise<void> {
    await prisma.shipment.update({
        where: { id: shipmentId },
        data: { route_geometry: routeGeometry },
    });
}
