import prisma from "@/lib/db/prisma";
import type { SettlementPeriod, DailyEarnings, DayOrder } from "@/lib/types/shipments";
import { cacheLife } from "next/cache";

interface WeeklySettlementRaw {
    week_start: Date;
    week_end: Date;
    trips: bigint;
    amount: string;
}

export async function getSettlements(
    logisticsId: string,
    dateFrom: Date,
    dateTo: Date,
): Promise<SettlementPeriod[]> {
    "use cache";
    cacheLife("minutes");

    const rows = await prisma.$queryRaw<WeeklySettlementRaw[]>`
        SELECT
            date_trunc('week', delivered_at)::date AS week_start,
            (date_trunc('week', delivered_at) + interval '6 days')::date AS week_end,
            COUNT(*)::bigint AS trips,
            SUM(price)::text AS amount
        FROM "Shipment"
        WHERE logistics_id = ${logisticsId}
          AND delivered_at >= ${dateFrom}
          AND delivered_at <= ${dateTo}
          AND status = 'delivered'
        GROUP BY date_trunc('week', delivered_at)
        ORDER BY week_start DESC
    `;

    return rows.map((row: WeeklySettlementRaw) => ({
        period: formatWeekPeriod(row.week_start, row.week_end),
        weekStart: row.week_start,
        weekEnd: row.week_end,
        trips: Number(row.trips),
        amount: Number(row.amount),
    }));
}

interface SettlementsDetailRaw {
    week_start: Date;
    week_end: Date;
    day: Date;
    trips: bigint;
    amount: string;
    orders: unknown;
}

interface OrderRaw {
    id: string;
    order_id: string;
    price: string;
    picked_up_at: string | null;
    delivered_at: string | null;
}

export async function getSettlementsDetail(
    logisticsId: string,
    dateFrom: Date,
    dateTo: Date,
): Promise<{
    settlements: SettlementPeriod[];
    dailyByWeek: Record<string, DailyEarnings[]>;
    ordersByDay: Record<string, DayOrder[]>;
}> {
    "use cache";
    cacheLife("minutes");

    const rows = await prisma.$queryRaw<SettlementsDetailRaw[]>`
        SELECT
            date_trunc('week', delivered_at)::date AS week_start,
            (date_trunc('week', delivered_at) + interval '6 days')::date AS week_end,
            date_trunc('day', delivered_at)::date AS day,
            COUNT(*)::bigint AS trips,
            SUM(price)::text AS amount,
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', id,
                    'order_id', order_id,
                    'price', price,
                    'picked_up_at', picked_up_at,
                    'delivered_at', delivered_at
                )
            ) AS orders
        FROM "Shipment"
        WHERE logistics_id = ${logisticsId}
          AND delivered_at >= ${dateFrom}
          AND delivered_at <= ${dateTo}
          AND status = 'delivered'
        GROUP BY date_trunc('week', delivered_at), date_trunc('day', delivered_at)
        ORDER BY week_start DESC, day DESC
    `;

    const settlements: SettlementPeriod[] = [];
    const dailyByWeek: Record<string, DailyEarnings[]> = {};
    const ordersByDay: Record<string, DayOrder[]> = {};

    for (const row of rows) {
        const weekKey = row.week_start.toISOString().split('T')[0];
        const dayKey = row.day.toISOString().split('T')[0];

        const trips = Number(row.trips);
        const amount = Number(row.amount);

        if (!dailyByWeek[weekKey]) {
            settlements.push({
                period: formatWeekPeriod(row.week_start, row.week_end),
                weekStart: row.week_start,
                weekEnd: row.week_end,
                trips: 0,
                amount: 0,
            });
            dailyByWeek[weekKey] = [];
        }

        const settlement = settlements.find(s => s.weekStart.getTime() === row.week_start.getTime())!;
        settlement.trips += trips;
        settlement.amount = Number((settlement.amount + amount).toFixed(2));

        const dayLabel = row.day.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' });

        dailyByWeek[weekKey].push({
            date: row.day,
            dayLabel,
            trips,
            amount,
        });

        const rawOrders = row.orders as OrderRaw[];
        ordersByDay[dayKey] = rawOrders.map(o => ({
            shippingId: o.id,
            price: Number(o.price),
            pickedUpAt: o.picked_up_at ? new Date(o.picked_up_at) : null,
            deliveredAt: o.delivered_at ? new Date(o.delivered_at) : null,
        }));
    }

    return { settlements, dailyByWeek, ordersByDay };
}

export type SettlementsDetail = Awaited<ReturnType<typeof getSettlementsDetail>>;

function formatWeekPeriod(start: Date, end: Date): string {
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const startStr = start.toLocaleDateString('es-AR', opts);
    const endStr = end.toLocaleDateString('es-AR', opts);
    return `${startStr} al ${endStr}`;
}
