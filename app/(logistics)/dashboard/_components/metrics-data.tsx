import { getDashboardMetrics } from "@/lib/db/queries/logistics/dashboard";
import { requireAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { MetricsGrid } from "./metrics-grid";

export async function MetricsData() {
    const user = await requireAuthenticatedUser();
    const metrics = await getDashboardMetrics(user.id);
    return <MetricsGrid metrics={metrics} />;
}
