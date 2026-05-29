import prisma from "@/lib/db/prisma";
import { Shipment } from "@/lib/schemas/domain";
import { detailSelect, toShipmentDetail } from "@/lib/db/queries/shared";
import { cacheLife } from "next/cache";

export async function getShipmentByTrackingCode(code: string): Promise<Shipment | null> {
    "use cache";
    cacheLife("minutes");

    const shipment = await prisma.shipment.findUnique({
        where: { tracking_code: code },
        select: detailSelect,
    });

    if (!shipment) return null;
    return toShipmentDetail(shipment);
}
