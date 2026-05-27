import { getSettlementsDetail } from "@/lib/db/queries/settlement";
import { getAuthenticatedUserId } from "@/lib/auth/get-authenticated-user";
import { EarningsMetrics } from "./earnings-metrics";
import { EarningsList } from "./earnings-list";

function currentMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
}

export async function SettlementsContent() {
    const user = await getAuthenticatedUserId();
    if (!user) return null;

    const { start, end } = currentMonthRange();
    const { settlements, dailyByWeek, ordersByDay } = await getSettlementsDetail(user.id, start, end);

    const monthTrips = settlements.reduce((sum, s) => sum + s.trips, 0);
    const monthTotal = settlements.reduce((sum, s) => sum + s.amount, 0);
    const metrics = {
        monthTotal,
        monthTrips,
        averagePerTrip: monthTrips > 0 ? Math.round(monthTotal / monthTrips) : 0,
    };

    return (
        <>
            <EarningsMetrics metrics={metrics} />
            <EarningsList
                settlements={settlements}
                dailyByWeek={dailyByWeek}
                ordersByDay={ordersByDay}
            />
        </>
    );
}
