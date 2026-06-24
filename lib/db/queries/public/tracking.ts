import prisma from "@/lib/db/prisma";
import { Shipment } from "@/lib/schemas/domain";
import { detailSelect, toShipmentDetail } from "@/lib/db/queries/shared";

export async function getShipmentByTrackingCode(code: string): Promise<Shipment | null> {
    const shipment = await prisma.shipment.findUnique({
        where: { tracking_code: code },
        select: detailSelect,
    });

    if (!shipment) return null;
    return toShipmentDetail(shipment);
}
