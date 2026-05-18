import prisma from "@/lib/db/prisma";
import type { SettlementPeriod } from "@/lib/definitions/shipment";

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
    const rows = await prisma.$queryRaw<WeeklySettlementRaw[]>`
        SELECT
            date_trunc('week', created_at)::date AS week_start,
            (date_trunc('week', created_at) + interval '6 days')::date AS week_end,
            COUNT(*)::bigint AS trips,
            SUM(price)::text AS amount
        FROM "Envio"
        WHERE logistics_id = ${logisticsId}
          AND created_at >= ${dateFrom}
          AND created_at <= ${dateTo}
          AND status = 'delivered'
        GROUP BY date_trunc('week', created_at)
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

function formatWeekPeriod(start: Date, end: Date): string {
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const startStr = start.toLocaleDateString('es-AR', opts);
    const endStr = end.toLocaleDateString('es-AR', opts);
    return `${startStr} al ${endStr}`;
}
