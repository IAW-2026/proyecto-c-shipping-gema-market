import { Suspense } from "react";
import { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { PageWrapper, Content } from "../_components/page-layout";
import { AvailableHeader } from "./_components/available-header";
import { AvailableData } from "./_components/available-data";
import { ShipmentCardsSkeleton } from "./_components/skeletons/shipment-cards-skeleton";

export const metadata: Metadata = {
    title: "Por tomar | UniHousing Shipping",
    description: "Listado de envíos pendientes de asignación. Interfaz para la exploración, filtrado y toma de nuevos paquetes según zona y prioridad de entrega.",
};
export default async function AvailablePage() {
    await requireRole([ROLES.LOGISTICS, ROLES.SHIPPING_ADMIN]);

    return (
        <PageWrapper>
            <AvailableHeader />
            <Content className="p-4 lgx:p-7">
                <Suspense fallback={<ShipmentCardsSkeleton />}>
                    <AvailableData />
                </Suspense>
            </Content>
        </PageWrapper>
    );
}