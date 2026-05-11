import { requireRole } from "@/lib/auth/rbac";
import { getDashboardMetrics, getActiveShipments } from "@/lib/db/queries/dashboard.queries";
import { PageWrapper, Content } from "../_components/page-layout";
import { DashboardHeader } from "./_components/dashboard-header";
import { ActiveShipmentsList } from "./_components/active-shipments-list";
import { Metadata } from "next";
import { ROLES } from "@/lib/definitions/auth";
import { MetricsGrid } from "./_components/metrics-grid";


export const metadata: Metadata = {
    title: "Dashboard Operativo | UniHousing Shipping",
    description: "Resumen ejecutivo de operaciones logísticas. Visualización en tiempo real de métricas críticas, envíos activos y rendimiento diario del operador.",
};

export default async function DashboardPage() {
    // 1. Validación de seguridad perimetral y extracción de identidad
    // Reemplazamos los magic strings por nuestras constantes inmutables
    const { userId } = await requireRole([ROLES.LOGISTICS, ROLES.SHIPPING_ADMIN]);

    // 2. Fetching de datos en paralelo
    // Al no depender una promesa de la otra, las ejecutamos al mismo tiempo para optimizar el rendimiento
    const metricsPromise = getDashboardMetrics(userId);
    const shipmentsPromise = getActiveShipments(userId);

    const [metrics, shipments] = await Promise.all([metricsPromise, shipmentsPromise]);

    return (
        <PageWrapper>
            {/* Componente específico que encapsula la lógica del header */}
            <DashboardHeader />
            <Content className="flex flex-col p-4 lgx:p-7 gap-6">
                <MetricsGrid metrics={metrics} />

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-[2fr_1fr]">
                    <ActiveShipmentsList shipments={shipments} />

                    {/* Espacio reservado para un componente secundario */}
                    <div className="bg-paper border border-line rounded-r3 p-6 flex items-center justify-center text-ink-3">
                        Módulo de Rendimiento (Próximamente)
                    </div>
                </div>
            </Content>
        </PageWrapper>
    );
}
