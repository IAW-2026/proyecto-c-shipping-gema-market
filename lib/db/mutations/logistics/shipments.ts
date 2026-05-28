import prisma from "@/lib/db/prisma";

export async function assignShipmentToDriver(
    shipmentId: string,
    driverId: string
) {
    return prisma.envio.update({
        where: { id: shipmentId, logistics_id: null, status: "waiting_for_courier" },
        data: { logistics_id: driverId, status: "pending_pickup" },
        select: { order_id: true, tracking_code: true, status: true },
    });
}

export async function transitionShipmentStatus(
    shipmentId: string,
    data: Record<string, unknown>
) {
    return prisma.envio.update({
        where: { id: shipmentId },
        data,
    });
}
