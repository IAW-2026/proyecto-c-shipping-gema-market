import { getSettlementsDetail } from "@/lib/db/queries/logistics/settlements";
import { getAuthenticatedUserId } from "@/lib/auth/get-authenticated-user";
import { EarningsMetrics } from "./earnings-metrics";
import { EarningsList } from "./earnings-list";
import { computeEarningsMetrics } from "./earnings-list-utils";

function last6WeeksRange(): { start: Date; end: Date } {
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
    return { start: weekStart, end: weekEnd };
}

export async function SettlementsContent() {
    const user = await getAuthenticatedUserId();
    if (!user) return null;

    const { start, end } = last6WeeksRange();
    const { settlements, dailyByWeek, ordersByDay } = await getSettlementsDetail(user.id, start, end);

    const metrics = computeEarningsMetrics(settlements);

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
