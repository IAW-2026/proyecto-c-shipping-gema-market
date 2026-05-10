import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { getShipmentOffers } from "@/lib/db/queries/shipments.queries";
import { PageWrapper, Content } from "../_components/page-layout";
import { AvailableHeader } from "./_components/available-header";
import { AvailableShipmentCard } from "./_components/shipment-card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Por tomar | UniHousing Shipping",
    description: "Listado de envíos pendientes de asignación. Interfaz para la exploración, filtrado y toma de nuevos paquetes según zona y prioridad de entrega.",
};
export default async function AvailablePage() {
    // 1. Protección de ruta (RBAC)
    await requireRole([ROLES.LOGISTICS, ROLES.SHIPPING_ADMIN]);

    // 2. Data Fetching (Mock)
    const offers = await getShipmentOffers();
    return (
        <PageWrapper>
            <AvailableHeader />
            <Content className="p-4 lgx:p-7">
                {/* Rejilla responsiva: 1 col móvil, 2 en tablet, 3 en desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer) => (
                        <AvailableShipmentCard
                            key={offer.shippingId}
                            offer={offer}
                        />
                    ))}
                </div>
            </Content>
        </PageWrapper>
    );
}