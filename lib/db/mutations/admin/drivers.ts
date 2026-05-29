import prisma from "@/lib/db/prisma";

export async function deleteDriver(driverId: string) {
    return prisma.$transaction(async (tx) => {
        await tx.shipment.updateMany({
            where: {
                logistics_id: driverId,
                status: { in: ["pending_pickup", "picked_up", "in_transit"] },
            },
            data: { logistics_id: null, status: "waiting_for_courier", picked_up_at: null, delivered_at: null },
        });

        await tx.user.delete({ where: { id: driverId } });
    });
}

export async function toggleBan(driverId: string, banned: boolean) {
    return prisma.user.update({
        where: { id: driverId },
        data: { banned },
        select: { clerk_user_id: true },
    });
}
