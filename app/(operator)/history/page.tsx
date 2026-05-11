import { Suspense } from "react";
import { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { HistoryFilters } from "./_components/history-filters";
import { PageWrapper, Content } from "../_components/page-layout";
import { HistoryHeader } from "./_components/history-header";
import { HistoryData } from "./_components/history-data";
import { HistoryTableSkeleton } from "./_components/skeletons/history-table-skeleton";

export const metadata: Metadata = {
    title: "Historial | UniHousing Shipping",
    description: "Registro histórico de envíos gestionados. Consulta detallada de estados anteriores, confirmaciones de entrega y trazabilidad completa de órdenes finalizadas.",
};

export default async function HistoryPage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const searchParams = await props.searchParams;
    const { userId } = await requireRole([ROLES.LOGISTICS, ROLES.SHIPPING_ADMIN]);

    const currentStatus = searchParams.status || "todos";
    const searchQuery = searchParams.search?.toLowerCase() || "";

    return (
        <PageWrapper>
            <HistoryHeader />
            <Content className="p-4 lgx:p-7">
                <HistoryFilters />
                <Suspense fallback={<HistoryTableSkeleton />} key={`${currentStatus}-${searchQuery}`}>
                    <HistoryData
                        userId={userId}
                        currentStatus={currentStatus}
                        searchQuery={searchQuery}
                    />
                </Suspense>
            </Content>
        </PageWrapper>
    );
}