import { getPerformanceData } from "@/lib/db/queries/dashboard";
import { getAuthContext } from "@/lib/auth/context";
import { getInternalUserId } from "@/lib/auth/get-internal-user-id";
import { PerformanceModuleWrapper } from "./performance-module-wrapper";

export async function PerformanceData() {
    const { clerkUserId } = await getAuthContext();
    if (!clerkUserId) return null;
    const user = await getInternalUserId(clerkUserId);
    if (!user) return null;
    const data = await getPerformanceData(user.id);
    return <PerformanceModuleWrapper data={data} />;
}
