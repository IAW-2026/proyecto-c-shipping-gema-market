import { Suspense } from "react";
import { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { PageWrapper, Content } from "../_components/page-layout";
import { DashboardHeader } from "./_components/dashboard-header";
import { MetricsData } from "./_components/metrics-data";
import { MetricsGridSkeleton } from "./_components/skeletons/metrics-grid-skeleton";
import { ActiveShipmentsData } from "./_components/active-shipments-data";
import { ActiveShipmentsListSkeleton } from "./_components/skeletons/active-shipments-list-skeleton";


export const metadata: Metadata = {
    title: "Dashboard Operativo | UniHousing Shipping",
    description: "Resumen ejecutivo de operaciones logísticas. Visualización en tiempo real de métricas críticas, envíos activos y rendimiento diario del operador.",
};

export default async function DashboardPage() {
    const { userId } = await requireRole([ROLES.LOGISTICS]);

    return (
        <PageWrapper>
            <DashboardHeader />
            <Content className="flex flex-col p-4 lgx:p-7 gap-6">
                <Suspense fallback={<MetricsGridSkeleton />}>
                    <MetricsData userId={userId} />
                </Suspense>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-[2fr_1fr]">
                    <Suspense fallback={<ActiveShipmentsListSkeleton />}>
                        <ActiveShipmentsData userId={userId} />
                    </Suspense>

                    <div className="bg-paper border border-line rounded-r3 p-6 flex items-center justify-center text-ink-3">
                        Módulo de Rendimiento (Próximamente)
                    </div>
                </div>
            </Content>
        </PageWrapper>
    );
}
