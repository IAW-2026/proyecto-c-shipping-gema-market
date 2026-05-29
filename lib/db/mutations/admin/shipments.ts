import prisma from "@/lib/db/prisma";

export async function updateShipmentPrice(shipmentId: string, price: number) {
    return prisma.shipment.update({
        where: { id: shipmentId },
        data: { price },
    });
}

export async function unassignDriver(shipmentId: string) {
    return prisma.shipment.update({
        where: { id: shipmentId },
        data: { logistics_id: null, status: "waiting_for_courier", picked_up_at: null, delivered_at: null },
    });
}

export async function deleteShipment(shipmentId: string) {
    return prisma.shipment.delete({ where: { id: shipmentId } });
}
