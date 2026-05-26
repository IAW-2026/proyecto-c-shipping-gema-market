import { Suspense } from "react";
import { PageWrapper, Header, Content } from "../_components";
import { ShipmentsFilters } from "./_components/shipments-filters";
import { AdminShipmentsTableData } from "./_components/shipments-table-data";
import { AdminShipmentsTableSkeleton } from "./_components/shipments-table-skeleton";

export default async function AdminShipmentsPage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { status, sortBy, sortOrder } = await props.searchParams;

    return (
        <PageWrapper>
            <Header title="Pedidos" subtitle="Gestión" />
            <div className="px-4 lgx:px-7 pb-4">
                <ShipmentsFilters />
            </div>
            <Content className="px-4 lgx:px-7 pb-4 lgx:pb-7">
                <Suspense fallback={<AdminShipmentsTableSkeleton />}>
                    <AdminShipmentsTableData status={status} sortBy={sortBy} sortOrder={sortOrder} />
                </Suspense>
            </Content>
        </PageWrapper>
    );
}
