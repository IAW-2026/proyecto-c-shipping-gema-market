import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/shared/auth-constants";
import { getAvailableShipments } from "@/lib/db/queries/available.queries";
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
    await requireRole([ROLES.LOGISTICS, ROLES.ADMIN]);

    // 2. Data Fetching (Mock)
    const shipments = await getAvailableShipments();
    return (
        <PageWrapper>
            <AvailableHeader />
            <Content className="p-4 lgx:p-7">
                {/* Rejilla responsiva: 1 col móvil, 2 en tablet, 3 en desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Hardcodeamos 6 tarjetas para validar el scroll y la grilla */}
                    <AvailableShipmentCard />
                    <AvailableShipmentCard />
                    <AvailableShipmentCard />
                    <AvailableShipmentCard />
                    <AvailableShipmentCard />
                    <AvailableShipmentCard />
                </div>
            </Content>
        </PageWrapper>
    );
}