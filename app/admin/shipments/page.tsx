import { Suspense } from "react";

import { PageWrapper, Header, Content } from "../_components";
import { ShipmentsFilters } from "./_components/shipments-filters";
import { AdminShipmentsTableData } from "./_components/shipments-table-data";
import { AdminShipmentsTableSkeleton } from "./_components/shipments-table-skeleton";



export default function AdminShipmentsPage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    return (
        <PageWrapper>
            <Header title="Pedidos" subtitle="Gestión" />
            <div className="px-4 lgx:px-7 pb-4">
                <Suspense fallback={<div className="h-10" />}>
                    <ShipmentsFilters />
                </Suspense>
            </div>
            <Content className="px-4 lgx:px-7 pb-4 lgx:pb-7">
                <Suspense fallback={<AdminShipmentsTableSkeleton />}>
                    <AdminShipmentsTableData searchParams={props.searchParams} />
                </Suspense>
            </Content>
        </PageWrapper>
    );
}
