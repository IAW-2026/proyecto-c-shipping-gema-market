import prisma from "@/lib/db/prisma";
import { cacheLife } from "next/cache";

interface ShipmentByOrder {
    id: string;
    order_id: string;
    status: string;
    tracking_code: string;
    pickup_address: unknown;
    delivery_address: unknown;
    price: number;
    picked_up_at: Date | null;
    delivered_at: Date | null;
}

const orderShipmentSelect = {
    id: true,
    order_id: true,
    status: true,
    tracking_code: true,
    pickup_address: true,
    delivery_address: true,
    price: true,
    picked_up_at: true,
    delivered_at: true,
} as const;

export async function getShipmentByOrderId(orderId: string): Promise<ShipmentByOrder | null> {
    "use cache";

    const shipment = await prisma.shipment.findUnique({
        where: { order_id: orderId },
        select: orderShipmentSelect,
    });

    if (!shipment) {
        cacheLife("seconds");
        return null;
    }

    cacheLife("minutes");
    return {
        id: shipment.id,
        order_id: shipment.order_id,
        status: shipment.status,
        tracking_code: shipment.tracking_code,
        pickup_address: shipment.pickup_address,
        delivery_address: shipment.delivery_address,
        price: Number(shipment.price),
        picked_up_at: shipment.picked_up_at,
        delivered_at: shipment.delivered_at,
    };
}
