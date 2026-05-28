import { toDate } from "@/lib/shared/date-utils";
import type { SettlementPeriod } from "@/lib/definitions/shipments";

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
    });
}

export function computeEarningsMetrics(settlements: SettlementPeriod[]) {
    const monthTotal = settlements.reduce((sum, s) => sum + s.amount, 0);
    const monthTrips = settlements.reduce((sum, s) => sum + s.trips, 0);
    return {
        monthTotal,
        monthTrips,
        averagePerTrip: monthTrips > 0 ? Math.round(monthTotal / monthTrips) : 0,
    };
}
