import { Metadata } from "next";
import { PageWrapper, Content } from "../_components/page-layout";
import { SettlementsHeader } from "./_components/settlements-header";
import { EarningsMetrics } from "./_components/earnings-metrics";
import { EarningsList, Settlement } from "./_components/earnings-list";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";

export const metadata: Metadata = {
    title: "Liquidaciones | UniHousing Shipping",
    description: "Gestión de liquidaciones y balance de ganancias. Detalle de pagos devengados por servicios logísticos prestados y estado de transferencias pendientes.",
};


const MOCK_METRICS = {
    monthTotal: 102060,
    monthTrips: 62,
    averagePerTrip: 1646,
};

const MOCK_SETTLEMENTS: Settlement[] = [
    { period: "Semana 17 - 27 abr", trips: 14, amount: 23760 },
    { period: "Semana 16 - 20 abr", trips: 19, amount: 31320 },
    { period: "Semana 15 - 13 abr", trips: 17, amount: 27180 },
    { period: "Semana 14 - 31 mar al 6 abr", trips: 12, amount: 19800 },
];

export default async function SettlementsPage() {
    // 1. Verificación de Identidad y Roles (Security Layer)
    await requireRole([ROLES.LOGISTICS, ROLES.SHIPPING_ADMIN]);
    return (
        <PageWrapper>
            <SettlementsHeader />
            <Content className="flex flex-col p-4 lgx:p-7 gap-6">
                <EarningsMetrics metrics={MOCK_METRICS} />
                <EarningsList settlements={MOCK_SETTLEMENTS} />
            </Content>
        </PageWrapper>
    );
}