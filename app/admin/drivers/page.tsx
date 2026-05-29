import { Suspense } from "react";

import { PageWrapper, Header, Content } from "../_components";
import { DriversFilters } from "./_components/drivers-filters";
import { AdminDriversTableData } from "./_components/drivers-table-data";
import { AdminDriversTableSkeleton } from "./_components/drivers-table-skeleton";



export default function AdminDriversPage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    return (
        <PageWrapper>
            <Header title="Repartidores" subtitle="Gestión" />
            <Content className="p-4 lgx:p-7">
                <Suspense fallback={<div className="h-10" />}>
                    <DriversFilters />
                </Suspense>
                <Suspense fallback={<AdminDriversTableSkeleton />}>
                    <AdminDriversTableData searchParams={props.searchParams} />
                </Suspense>
            </Content>
        </PageWrapper>
    );
}
