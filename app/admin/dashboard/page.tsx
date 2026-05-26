import { Suspense } from "react";
import { PageWrapper, Header, Content } from "../_components/page-layout";
import { AdminDashboardMetrics } from "./_components/dashboard-metrics";
import { AdminDashboardMetricsSkeleton } from "./_components/dashboard-metrics-skeleton";

export default function AdminDashboardPage() {
    return (
        <PageWrapper>
            <Header title="Panel de Administración" subtitle="Dashboard" />
            <Content className="p-4 lgx:p-7">
                <Suspense fallback={<AdminDashboardMetricsSkeleton />}>
                    <AdminDashboardMetrics />
                </Suspense>
            </Content>
        </PageWrapper>
    );
}
