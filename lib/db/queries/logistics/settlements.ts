import prisma from "@/lib/db/prisma";
import type { SettlementPeriod, DailyEarnings, DayOrder } from "@/lib/definitions/shipments";
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
        FROM "Envio"
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
    const rows = await prisma.$queryRaw<Array<{
        id: string;
        order_id: string;
        price: unknown;
        picked_up_at: Date | null;
        delivered_at: Date | null;
        created_at: Date;
    }>>`
        SELECT id, order_id, price, picked_up_at, delivered_at, created_at
        FROM "Envio"
        WHERE logistics_id = ${logisticsId}
          AND delivered_at >= ${dateFrom}
          AND delivered_at <= ${dateTo}
          AND status = 'delivered'
        ORDER BY delivered_at DESC
    `;

    const weekMap = new Map<string, {
        shipments: typeof rows;
        weekStart: Date;
        weekEnd: Date;
    }>();

    for (const s of rows) {
        const d = new Date(s.delivered_at!);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(d);
        monday.setDate(d.getDate() + diff);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const key = monday.toISOString().split('T')[0];
        if (!weekMap.has(key)) {
            weekMap.set(key, { shipments: [], weekStart: monday, weekEnd: sunday });
        }
        weekMap.get(key)!.shipments.push(s);
    }

    const settlements: SettlementPeriod[] = [];
    const dailyByWeek: Record<string, DailyEarnings[]> = {};
    const ordersByDay: Record<string, DayOrder[]> = {};

    const weekKeysSorted = Array.from(weekMap.keys()).sort((a, b) => b.localeCompare(a));

    for (const weekKey of weekKeysSorted) {
        const weekData = weekMap.get(weekKey)!;
        const trips = weekData.shipments.length;
        const amount = Number(weekData.shipments.reduce((sum, s) => sum + Number(s.price), 0).toFixed(2));

        settlements.push({
            period: formatWeekPeriod(weekData.weekStart, weekData.weekEnd),
            weekStart: weekData.weekStart,
            weekEnd: weekData.weekEnd,
            trips,
            amount,
        });

        const dayMap = new Map<string, typeof weekData.shipments>();
        for (const s of weekData.shipments) {
            const dayKey = s.delivered_at!.toISOString().split('T')[0];
            if (!dayMap.has(dayKey)) {
                dayMap.set(dayKey, []);
            }
            dayMap.get(dayKey)!.push(s);
        }

        const dayKeysSorted = Array.from(dayMap.keys()).sort((a, b) => b.localeCompare(a));
        const dailyEarnings: DailyEarnings[] = [];

        for (const dayKey of dayKeysSorted) {
            const dayShipments = dayMap.get(dayKey)!;
            const dayDate = new Date(dayKey + 'T12:00:00');
            const dayLabel = dayDate.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' });
            const dayAmount = Number(dayShipments.reduce((sum, s) => sum + Number(s.price), 0).toFixed(2));

            dailyEarnings.push({
                date: dayDate,
                dayLabel,
                trips: dayShipments.length,
                amount: dayAmount,
            });

            ordersByDay[dayKey] = dayShipments.map(s => ({
                orderId: s.order_id,
                price: Number(s.price),
                pickedUpAt: s.picked_up_at,
                deliveredAt: s.delivered_at,
            }));
        }

        dailyByWeek[weekKey] = dailyEarnings;
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
