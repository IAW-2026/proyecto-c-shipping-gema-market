import prisma from "@/lib/db/prisma";
import { AddressSchema, ShippingStatusSchema } from "@/lib/definitions/shipment";
import type { ShipmentSummary } from "@/lib/definitions/shipment";
import type { DashboardMetrics, OperatorDashboardData, PerformanceData, WeekData } from "@/lib/definitions/dashboard-metrics";
import { getSettlements } from "./settlement";

const summarySelect = {
    id: true,
    order_id: true,
    tracking_code: true,
    status: true,
    pickup_address: true,
    delivery_address: true,
    price: true,
    created_at: true,
} as const;

interface SummaryRaw {
    id: string;
    order_id: string;
    tracking_code: string;
    status: string;
    pickup_address: unknown;
    delivery_address: unknown;
    price: unknown;
    created_at: Date;
}

function toSummary(row: SummaryRaw): ShipmentSummary {
    return {
        shippingId: row.id,
        orderId: row.order_id,
        trackingCode: row.tracking_code,
        status: ShippingStatusSchema.parse(row.status),
        pickupAddress: AddressSchema.parse(row.pickup_address),
        deliveryAddress: AddressSchema.parse(row.delivery_address),
        price: Number(row.price),
        createdAt: row.created_at,
    };
}

function startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

export async function getDashboardData(operatorId: string): Promise<OperatorDashboardData> {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [todayAggregation, activeShipments] = await Promise.all([
        prisma.envio.aggregate({
            where: {
                logistics_id: operatorId,
                status: 'delivered',
                created_at: { gte: todayStart, lte: todayEnd },
            },
            _count: { id: true },
            _sum: { price: true, route_distance: true },
        }),
        prisma.envio.findMany({
            where: {
                logistics_id: operatorId,
                status: { in: ['pending_pickup', 'picked_up', 'in_transit'] },
            },
            orderBy: { created_at: 'desc' },
            select: summarySelect,
        }),
    ]);

    const totalDistanceMeters = todayAggregation._sum.route_distance ?? 0;
    const metrics: DashboardMetrics = {
        shipmentToday: todayAggregation._count.id,
        totalEarnings: Number(todayAggregation._sum.price ?? 0),
        totalDistance: Math.round(Number(totalDistanceMeters) / 1000),
    };

    return { metrics, activeShipments: activeShipments.map(toSummary) };
}

export async function getDashboardMetrics(operatorId: string): Promise<DashboardMetrics> {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const aggregation = await prisma.envio.aggregate({
        where: {
            logistics_id: operatorId,
            status: 'delivered',
            created_at: { gte: todayStart, lte: todayEnd },
        },
        _count: { id: true },
        _sum: { price: true, route_distance: true },
    });

    const totalDistanceMeters = aggregation._sum.route_distance ?? 0;
    return {
        shipmentToday: aggregation._count.id,
        totalEarnings: Number(aggregation._sum.price ?? 0),
        totalDistance: Math.round(Number(totalDistanceMeters) / 1000),
    };
}

export async function getActiveShipments(operatorId: string): Promise<ShipmentSummary[]> {
    const shipments = await prisma.envio.findMany({
        where: {
            logistics_id: operatorId,
            status: { in: ['pending_pickup', 'picked_up', 'in_transit'] },
        },
        orderBy: { created_at: 'desc' },
        select: summarySelect,
    });

    return shipments.map(toSummary);
}

function getLast6WeeksRange(): { dateFrom: Date; dateTo: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() + diffToMonday);
    currentMonday.setHours(0, 0, 0, 0);

    const weekEnd = new Date(currentMonday);
    weekEnd.setDate(currentMonday.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(currentMonday);
    weekStart.setDate(currentMonday.getDate() - 5 * 7);

    return { dateFrom: weekStart, dateTo: weekEnd };
}

function formatShortLabel(date: Date): string {
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return date.toLocaleDateString("es-AR", opts);
}

function calcChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

export async function getPerformanceData(operatorId: string): Promise<PerformanceData> {
    const { dateFrom, dateTo } = getLast6WeeksRange();

    const settlements = await getSettlements(operatorId, dateFrom, dateTo);

    const currentWeek = settlements[0];
    const previousWeek = settlements[1];

    const weeklyEarnings = currentWeek?.amount ?? 0;
    const weeklyTrips = currentWeek?.trips ?? 0;
    const prevEarnings = previousWeek?.amount ?? 0;
    const prevTrips = previousWeek?.trips ?? 0;

    const weeklyHistory: WeekData[] = settlements
        .slice()
        .reverse()
        .map((s) => ({
            label: formatShortLabel(s.weekStart),
            earnings: s.amount,
            trips: s.trips,
        }));

    return {
        weeklyEarnings,
        weeklyTrips,
        avgPerTrip: weeklyTrips > 0 ? Math.round(weeklyEarnings / weeklyTrips) : 0,
        earningsChange: calcChange(weeklyEarnings, prevEarnings),
        tripsChange: calcChange(weeklyTrips, prevTrips),
        weeklyHistory,
    };
}
