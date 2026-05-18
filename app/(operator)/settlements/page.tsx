import { Metadata } from "next";
import { PageWrapper, Content } from "../_components/page-layout";
import { SettlementsHeader } from "./_components/settlements-header";
import { EarningsMetrics } from "./_components/earnings-metrics";
import { EarningsList } from "./_components/earnings-list";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { getSettlements } from "@/lib/db/queries/settlement";

export const metadata: Metadata = {
    title: "Liquidaciones | UniHousing Shipping",
    description: "Gestión de liquidaciones y balance de ganancias. Detalle de pagos devengados por servicios logísticos prestados y estado de transferencias pendientes.",
};

function currentMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
}

export default async function SettlementsPage() {
    const { userId } = await requireRole([ROLES.LOGISTICS, ROLES.SHIPPING_ADMIN]);
    const { start, end } = currentMonthRange();

    const settlements = await getSettlements(userId, start, end);

    const monthTrips = settlements.reduce((sum, s) => sum + s.trips, 0);
    const monthTotal = settlements.reduce((sum, s) => sum + s.amount, 0);
    const metrics = {
        monthTotal,
        monthTrips,
        averagePerTrip: monthTrips > 0 ? Math.round(monthTotal / monthTrips) : 0,
    };

    return (
        <PageWrapper>
            <SettlementsHeader />
            <Content className="flex flex-col p-4 lgx:p-7 gap-6">
                <EarningsMetrics metrics={metrics} />
                <EarningsList settlements={settlements} />
            </Content>
        </PageWrapper>
    );
}