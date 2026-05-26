import { Suspense } from "react";
import { Metadata } from "next";
import { AvailableSearchParamsSchema } from "@/lib/validations/shipment";
import { PageWrapper, Content } from "../_components/page-layout";
import { AvailableHeader } from "./_components/available-header";
import { AvailableData } from "./_components/available-data";
import { AvailableFiltersDialog } from "./_components/available-filters";
import { FilterDialogProvider } from "./_components/filter-dialog-context";
import { AvailableSortBar } from "./_components/available-sort-bar";
import { ShipmentCardsSkeleton } from "./_components/skeletons/shipment-cards-skeleton";

export const metadata: Metadata = {
    title: "Por tomar | UniHousing Shipping",
    description: "Listado de envíos pendientes de asignación. Interfaz para la exploración, filtrado y toma de nuevos paquetes según zona y prioridad de entrega.",
};

export default async function AvailablePage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const raw = await props.searchParams;
    const params = AvailableSearchParamsSchema.parse(raw);

    return (
        <PageWrapper>
            <FilterDialogProvider>
            <AvailableHeader />
            <AvailableFiltersDialog />
            <div className="px-4 lgx:px-7 pb-3">
                <AvailableSortBar />
            </div>
            <Content className="p-4 lgx:p-7 pt-0">
                <Suspense fallback={<ShipmentCardsSkeleton />}>
                    <AvailableData
                        sortBy={params.sortBy}
                        sortOrder={params.sortOrder}
                        weightMin={params.weightMin}
                        weightMax={params.weightMax}
                        priceMin={params.priceMin}
                        priceMax={params.priceMax}
                        distanceMin={params.distanceMin}
                        distanceMax={params.distanceMax}
                    />
                </Suspense>
            </Content>
            </FilterDialogProvider>
        </PageWrapper>
    );
}