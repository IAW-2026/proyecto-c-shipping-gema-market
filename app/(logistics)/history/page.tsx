import { Suspense } from "react";

import { Metadata } from "next";
import { HistoryFilters } from "./_components/history-filters";
import { PageWrapper, Content } from "../_components/page-layout";
import { HistoryHeader } from "./_components/history-header";
import { HistoryData } from "./_components/history-data";
import { HistoryTableSkeleton } from "./_components/skeletons/history-table-skeleton";



export const metadata: Metadata = {
    title: "Historial | UniHousing Shipping",
    description: "Registro histórico de envíos gestionados. Consulta detallada de estados anteriores, confirmaciones de entrega y trazabilidad completa de órdenes finalizadas.",
};

export default function HistoryPage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    return (
        <PageWrapper>
            <HistoryHeader />
            <Content className="p-4 lgx:p-7">
                <Suspense fallback={<div className="h-10 mb-6" />}>
                    <HistoryFilters />
                </Suspense>
                <Suspense fallback={<HistoryTableSkeleton />}>
                    <HistoryData searchParams={props.searchParams} />
                </Suspense>
            </Content>
        </PageWrapper>
    );
}
