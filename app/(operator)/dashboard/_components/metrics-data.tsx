import { getDashboardMetrics } from "@/lib/db/queries/dashboard";
import { MetricsGrid } from "./metrics-grid";

export async function MetricsData({ userId }: { userId: string }) {
    const metrics = await getDashboardMetrics(userId);
    return <MetricsGrid metrics={metrics} />;
}
