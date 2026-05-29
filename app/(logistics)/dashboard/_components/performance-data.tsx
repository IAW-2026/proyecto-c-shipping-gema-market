import { getPerformanceData } from "@/lib/db/queries/logistics/dashboard";
import { requireAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { PerformanceModuleWrapper } from "./performance-module-wrapper";

export async function PerformanceData() {
    const user = await requireAuthenticatedUser();
    const data = await getPerformanceData(user.id);
    return <PerformanceModuleWrapper data={data} />;
}
