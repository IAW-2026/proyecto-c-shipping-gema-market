import { Suspense } from "react";

import { Metadata } from "next";
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

export default function AvailablePage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    return (
        <PageWrapper>
            <FilterDialogProvider>
            <AvailableHeader />
            <Suspense fallback={<div className="px-4 lgx:px-7 pb-3 h-10" />}>
                <AvailableFiltersDialog />
            </Suspense>
            <div className="px-4 lgx:px-7 pb-3">
                <Suspense fallback={<div className="h-10" />}>
                    <AvailableSortBar />
                </Suspense>
            </div>
            <Content className="p-4 lgx:p-7 pt-0">
                <Suspense fallback={<ShipmentCardsSkeleton />}>
                    <AvailableData searchParams={props.searchParams} />
                </Suspense>
            </Content>
            </FilterDialogProvider>
        </PageWrapper>
    );
}
