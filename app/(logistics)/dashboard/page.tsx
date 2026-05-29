import { Suspense } from "react";

import { Metadata } from "next";
import { PageWrapper, Content } from "../_components/page-layout";
import { DashboardHeader, DashboardHeaderSkeleton } from "./_components/dashboard-header";
import { MetricsData } from "./_components/metrics-data";
import { MetricsGridSkeleton } from "./_components/skeletons/metrics-grid-skeleton";
import { ActiveShipmentsData } from "./_components/active-shipments-data";
import { ActiveShipmentsListSkeleton } from "./_components/skeletons/active-shipments-list-skeleton";
import { PerformanceData } from "./_components/performance-data";
import { PerformanceSkeleton } from "./_components/skeletons/performance-skeleton";



export const metadata: Metadata = {
    title: "Dashboard Operativo | UniHousing Shipping",
    description: "Resumen ejecutivo de operaciones logísticas. Visualización en tiempo real de métricas críticas, envíos activos y rendimiento diario del operador.",
};

export default function DashboardPage() {
    return (
        <PageWrapper>
            <Suspense fallback={<DashboardHeaderSkeleton />}>
                <DashboardHeader />
            </Suspense>
            <Content className="flex flex-col p-4 lgx:p-7 gap-6">
                <Suspense fallback={<MetricsGridSkeleton />}>
                    <MetricsData />
                </Suspense>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-[2fr_1fr]">
                    <Suspense fallback={<ActiveShipmentsListSkeleton />}>
                        <ActiveShipmentsData />
                    </Suspense>

                    <Suspense fallback={<PerformanceSkeleton />}>
                        <PerformanceData />
                    </Suspense>
                </div>
            </Content>
        </PageWrapper>
    );
}
