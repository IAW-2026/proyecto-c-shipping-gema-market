import prisma from "@/lib/db/prisma";
import { AddressSchema, ShippingStatusSchema } from "@/lib/definitions/shipment";
import type { ShipmentSummary } from "@/lib/definitions/shipment";
import type { DashboardMetrics, OperatorDashboardData } from "@/lib/definitions/dashboard-metrics";

// --- Selector y tipo auxiliar para filas de envío resumido ---

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
            _sum: { price: true },
        }),
        prisma.envio.findMany({
            where: {
                logistics_id: operatorId,
                status: { in: ['pending_pickup', 'in_transit'] },
            },
            orderBy: { created_at: 'desc' },
            select: summarySelect,
        }),
    ]);

    const metrics: DashboardMetrics = {
        shipmentToday: todayAggregation._count.id,
        totalEarnings: Number(todayAggregation._sum.price ?? 0),
        totalDistance: 0,
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
        _sum: { price: true },
    });

    return {
        shipmentToday: aggregation._count.id,
        totalEarnings: Number(aggregation._sum.price ?? 0),
        totalDistance: 0,
    };
}

export async function getActiveShipments(operatorId: string): Promise<ShipmentSummary[]> {
    const shipments = await prisma.envio.findMany({
        where: {
            logistics_id: operatorId,
            status: { in: ['pending_pickup', 'in_transit'] },
        },
        orderBy: { created_at: 'desc' },
        select: summarySelect,
    });

    return shipments.map(toSummary);
}
