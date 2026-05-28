import prisma from "@/lib/db/prisma";
import { Shipment } from "@/lib/definitions/shipments";
import { detailSelect, toShipmentDetail } from "@/lib/db/queries/shared";
import { cacheLife } from "next/cache";

export async function getShipmentDetails(shippingId: string): Promise<Shipment | null> {
    "use cache";
    cacheLife("minutes");

    const shipment = await prisma.envio.findUnique({
        where: { id: shippingId },
        select: detailSelect,
    });

    if (!shipment) return null;
    return toShipmentDetail(shipment);
}
