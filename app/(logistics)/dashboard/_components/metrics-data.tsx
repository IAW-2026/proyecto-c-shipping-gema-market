import { getDashboardMetrics } from "@/lib/db/queries/dashboard";
import { getAuthContext } from "@/lib/auth/context";
import { getInternalUserId } from "@/lib/auth/get-internal-user-id";
import { MetricsGrid } from "./metrics-grid";

export async function MetricsData() {
    const { clerkUserId } = await getAuthContext();
    if (!clerkUserId) return null;
    const user = await getInternalUserId(clerkUserId);
    if (!user) return null;
    const metrics = await getDashboardMetrics(user.id);
    return <MetricsGrid metrics={metrics} />;
}
