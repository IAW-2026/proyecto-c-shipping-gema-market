import { toDate } from "@/lib/utils/date-utils";
import type { SettlementPeriod } from "@/lib/types/shipments";

export function formatDateKey(date: Date): string {
    return new Date(date).toISOString().split("T")[0];
}

export function formatDateTime(date: Date | string | null): string {
    if (!date) return "-";
    const d = toDate(date)!;
    return d.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Argentina/Buenos_Aires",
    });
}

export function computeEarningsMetrics(settlements: SettlementPeriod[]) {
    const periodTotal = settlements.reduce((sum, s) => sum + s.amount, 0);
    const periodTrips = settlements.reduce((sum, s) => sum + s.trips, 0);
    return {
        periodTotal,
        periodTrips,
        averagePerTrip: periodTrips > 0 ? Math.round(periodTotal / periodTrips) : 0,
    };
}
