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

export async function updateShipmentLogistics(
    shipmentId: string,
    logisticsId: string | null,
) {
    const shipment = await prisma.shipment.findUnique({
        where: { id: shipmentId },
        select: { id: true, status: true },
    });

    if (!shipment) {
        return { error: "NOT_FOUND", message: "Envío no encontrado" };
    }

    if (logisticsId === null) {
        // Desasignar
        const updated = await prisma.shipment.update({
            where: { id: shipmentId },
            data: {
                logistics_id: null,
                status: "waiting_for_courier",
                picked_up_at: null,
                delivered_at: null,
            },
        });
        return { success: true, shipment: updated };
    }

    const driver = await prisma.user.findUnique({
        where: { id: logisticsId },
        select: { id: true, banned: true, role: true },
    });

    if (!driver) {
        return { error: "NOT_FOUND", message: "Fletero no encontrado" };
    }

    if (driver.role !== "logistics") {
        return { error: "INVALID_ROLE", message: "El usuario no es un fletero" };
    }

    if (driver.banned) {
        return { error: "BANNED", message: "El fletero está suspendido" };
    }

    const updated = await prisma.shipment.update({
        where: { id: shipmentId },
        data: {
            logistics_id: logisticsId,
            status: "pending_pickup",
            picked_up_at: null,
            delivered_at: null,
        },
    });

    return { success: true, shipment: updated };
}
