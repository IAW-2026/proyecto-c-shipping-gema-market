import { Suspense } from "react";
import { PageWrapper, Header, Content } from "../_components";
import { DriversFilters } from "./_components/drivers-filters";
import { AdminDriversTableData } from "./_components/drivers-table-data";
import { AdminDriversTableSkeleton } from "./_components/drivers-table-skeleton";

export default async function AdminDriversPage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { search, banned } = await props.searchParams;

    return (
        <PageWrapper>
            <Header title="Repartidores" subtitle="Gestión" />
            <Content className="p-4 lgx:p-7">
                <DriversFilters />
                <Suspense fallback={<AdminDriversTableSkeleton />}>
                    <AdminDriversTableData search={search} banned={banned as "all" | "banned" | "active" | undefined} />
                </Suspense>
            </Content>
        </PageWrapper>
    );
}
