import { Suspense } from "react";
import { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { AvailableSearchParamsSchema } from "@/lib/validations/shipment";
import { PageWrapper, Content } from "../_components/page-layout";
import { AvailableHeader } from "./_components/available-header";
import { AvailableData } from "./_components/available-data";
import { ShipmentCardsSkeleton } from "./_components/skeletons/shipment-cards-skeleton";
import { SearchInput } from "@/components/ui/search-input";

export const metadata: Metadata = {
    title: "Por tomar | UniHousing Shipping",
    description: "Listado de envíos pendientes de asignación. Interfaz para la exploración, filtrado y toma de nuevos paquetes según zona y prioridad de entrega.",
};

export default async function AvailablePage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    await requireRole([ROLES.LOGISTICS]);
    const raw = await props.searchParams;
    const params = AvailableSearchParamsSchema.parse(raw);

    return (
        <PageWrapper>
            <AvailableHeader />
            <Content className="p-4 lgx:p-7">
                <div className="mb-6">
                    <SearchInput placeholder="Buscar por tracking ID..." />
                </div>
                <Suspense fallback={<ShipmentCardsSkeleton />}>
                    <AvailableData searchQuery={params.search} />
                </Suspense>
            </Content>
        </PageWrapper>
    );
}