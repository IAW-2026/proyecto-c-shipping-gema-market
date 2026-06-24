import prisma from "@/lib/db/prisma";
import { cacheLife } from "next/cache";
import { ADMIN_DAYS, SECONDS_PER_TRANSIT_DAY, MAX_TRANSIT_DAYS } from "@/lib/constants/shipment";

interface ShippingAdminStats {
    total_shipments: number;
    shipments_by_status: Record<string, number>;
    average_delivery_hours: number | null;
    on_time_rate: number;
}

interface TimeseriesPoint {
    bucket: string;
    value: number;
}

interface ShippingAdminTimeseries {
    granularity: string;
    series: TimeseriesPoint[];
}

export async function getShippingAdminStats(
    dateFrom?: string,
    dateTo?: string,
): Promise<ShippingAdminStats> {
    "use cache";
    cacheLife("minutes");

    const dateFilter: Record<string, unknown> = {};
    if (dateFrom) {
        dateFilter.gte = new Date(dateFrom);
    }
    if (dateTo) {
        dateFilter.lte = new Date(dateTo);
    }

    const where = Object.keys(dateFilter).length > 0
        ? { created_at: dateFilter }
        : {};

    const total_shipments = await prisma.shipment.count({ where });

    const statusCounts = await prisma.shipment.groupBy({
        by: ["status"],
        where,
        _count: { status: true },
    });

    const shipments_by_status: Record<string, number> = {
        waiting_for_courier: 0,
        pending_pickup: 0,
        picked_up: 0,
        in_transit: 0,
        delivered: 0,
    };

    for (const sc of statusCounts) {
        shipments_by_status[sc.status] = sc._count.status;
    }

    let average_delivery_hours: number | null = null;

    const deliveredWhere: Record<string, unknown> = { status: "delivered" };
    if (dateFrom) deliveredWhere.created_at = { ...(deliveredWhere.created_at as Record<string, unknown> || {}), gte: new Date(dateFrom) };
    if (dateTo) deliveredWhere.created_at = { ...(deliveredWhere.created_at as Record<string, unknown> || {}), lte: new Date(dateTo) };

    const deliveredShipments = await prisma.shipment.findMany({
        where: deliveredWhere,
        select: { picked_up_at: true, delivered_at: true },
    });

    const hoursList: number[] = [];
    for (const s of deliveredShipments) {
        if (s.picked_up_at && s.delivered_at) {
            const diffMs = s.delivered_at.getTime() - s.picked_up_at.getTime();
            if (diffMs > 0) {
                hoursList.push(diffMs / (1000 * 60 * 60));
            }
        }
    }

    if (hoursList.length > 0) {
        average_delivery_hours = hoursList.reduce((a, b) => a + b, 0) / hoursList.length;
        average_delivery_hours = Math.round(average_delivery_hours * 10) / 10;
    }

    // --- on_time_rate calculation ---
    const onTimeDelivered = await prisma.shipment.findMany({
        where: { ...deliveredWhere },
        select: { created_at: true, delivered_at: true, route_duration: true },
    });

    let onTimeCount = 0;
    for (const s of onTimeDelivered) {
        if (!s.delivered_at) continue;
        let estimatedDays: number;
        if (s.route_duration && s.route_duration > 0) {
            const transitDays = Math.ceil(s.route_duration / SECONDS_PER_TRANSIT_DAY);
            estimatedDays = ADMIN_DAYS + Math.min(transitDays, MAX_TRANSIT_DAYS);
        } else {
            estimatedDays = 2; // default matching calculateEstimatedDays(undefined)
        }
        const deadline = new Date(s.created_at.getTime() + estimatedDays * 86400000);
        if (s.delivered_at <= deadline) {
            onTimeCount++;
        }
    }
    const on_time_rate = onTimeDelivered.length > 0
        ? Math.round((onTimeCount / onTimeDelivered.length) * 1000) / 1000
        : 0;

    return {
        total_shipments,
        shipments_by_status,
        average_delivery_hours,
        on_time_rate,
    };
}

export async function getShippingAdminTimeseries(
    dateFrom: string,
    dateTo: string,
    granularity: "day" | "week" | "month",
    metric: "shipments" | "delivered",
): Promise<ShippingAdminTimeseries> {
    "use cache";
    cacheLife("minutes");

    const truncUnit = granularity === "day"
        ? "day"
        : granularity === "week"
            ? "week"
            : "month";

    const dateColumn = metric === "delivered" ? "delivered_at" : "created_at";

    const results = await prisma.$queryRawUnsafe<{ bucket: Date; value: bigint }[]>(
        `SELECT date_trunc('${truncUnit}', "${dateColumn}") AS bucket, COUNT(*) AS value
         FROM "Shipment"
         WHERE "${dateColumn}" >= $1 AND "${dateColumn}" <= $2
         GROUP BY bucket
         ORDER BY bucket ASC`,
        new Date(dateFrom),
        new Date(dateTo),
    );

    const series: TimeseriesPoint[] = results.map((r) => ({
        bucket: r.bucket.toISOString().split("T")[0],
        value: Number(r.value),
    }));

    return {
        granularity,
        series,
    };
}
