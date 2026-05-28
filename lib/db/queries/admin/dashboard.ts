import prisma from "@/lib/db/prisma";
import type { AdminDashboardMetrics } from "@/lib/definitions/admin-dashboard-metrics";
import { cacheLife } from "next/cache";

function startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
    "use cache";
    cacheLife("minutes");

    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [
        totalDrivers,
        totalShipments,
        shipmentsByStatus,
        shipmentsToday,
        totalRates,
    ] = await Promise.all([
        prisma.user.count({ where: { role: "logistics" } }),
        prisma.shipment.count(),
        prisma.shipment.groupBy({
            by: ["status"],
            _count: { id: true },
        }),
        prisma.shipment.count({
            where: { created_at: { gte: todayStart, lte: todayEnd } },
        }),
        prisma.rate.count(),
    ]);

    const byStatus: Record<string, number> = {};
    for (const group of shipmentsByStatus) {
        byStatus[group.status] = group._count.id;
    }

    const activeStatuses = ["pending_pickup", "picked_up", "in_transit"];
    const activeShipments = Object.entries(byStatus)
        .filter(([status]) => activeStatuses.includes(status))
        .reduce((sum, [, count]) => sum + count, 0);

    return {
        totalDrivers,
        totalShipments,
        shipmentsByStatus: byStatus,
        shipmentsToday,
        totalRates,
        activeShipments,
    };
}
