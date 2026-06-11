import prisma from "@/lib/db/prisma";
import type { AdminDashboardMetrics } from "@/lib/types/admin-dashboard-metrics";
import { cacheLife } from "next/cache";

function startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

interface DashboardRaw {
    total_drivers: bigint;
    total_shipments: bigint;
    shipments_today: bigint;
    total_rates: bigint;
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
    "use cache";
    cacheLife("minutes");

    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [aggregates] = await prisma.$queryRaw<DashboardRaw[]>`
        SELECT
            (SELECT COUNT(*) FROM "User" WHERE role = 'logistics') AS total_drivers,
            (SELECT COUNT(*) FROM "Shipment") AS total_shipments,
            (SELECT COUNT(*) FROM "Shipment" WHERE created_at >= ${todayStart} AND created_at <= ${todayEnd}) AS shipments_today,
            (SELECT COUNT(*) FROM "Rate") AS total_rates
    `;

    const statusCounts = await prisma.shipment.groupBy({
        by: ["status"],
        _count: { id: true },
    });

    const byStatus: Record<string, number> = {};
    for (const group of statusCounts) {
        byStatus[group.status] = group._count.id;
    }

    const activeStatuses = ["pending_pickup", "picked_up", "in_transit"];
    const activeShipments = Object.entries(byStatus)
        .filter(([status]) => activeStatuses.includes(status))
        .reduce((sum, [, count]) => sum + count, 0);

    return {
        totalDrivers: Number(aggregates.total_drivers),
        totalShipments: Number(aggregates.total_shipments),
        shipmentsByStatus: byStatus,
        shipmentsToday: Number(aggregates.shipments_today),
        totalRates: Number(aggregates.total_rates),
        activeShipments,
    };
}
