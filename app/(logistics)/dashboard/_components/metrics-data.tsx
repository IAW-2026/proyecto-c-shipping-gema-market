import { getDashboardMetrics } from "@/lib/db/queries/logistics/dashboard";
import { getAuthenticatedUserId } from "@/lib/auth/get-authenticated-user";
import { MetricsGrid } from "./metrics-grid";

export async function MetricsData() {
    const user = await getAuthenticatedUserId();
    if (!user) return null;
    const metrics = await getDashboardMetrics(user.id);
    return <MetricsGrid metrics={metrics} />;
}
