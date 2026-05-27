import { getPerformanceData } from "@/lib/db/queries/dashboard";
import { getAuthenticatedUserId } from "@/lib/auth/get-authenticated-user";
import { PerformanceModuleWrapper } from "./performance-module-wrapper";

export async function PerformanceData() {
    const user = await getAuthenticatedUserId();
    if (!user) return null;
    const data = await getPerformanceData(user.id);
    return <PerformanceModuleWrapper data={data} />;
}
