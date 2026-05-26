import { getPerformanceData } from "@/lib/db/queries/dashboard";
import { PerformanceModule } from "./performance-module";

export async function PerformanceData({ userId }: { userId: string }) {
    const data = await getPerformanceData(userId);
    return <PerformanceModule data={data} />;
}
