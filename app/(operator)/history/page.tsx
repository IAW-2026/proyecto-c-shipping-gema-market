import { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/shared/auth-constants";
import { HistoryFilters } from "./_components/history-filters";
import { PageWrapper, Content } from "../_components/page-layout";
import { HistoryHeader } from "./_components/history-header";
import { HistoryTabs } from "./_components/history-tabs";
import { HistoryTable } from "./_components/history-table";
import { getShipmentHistory } from "@/lib/db/queries/shipments.queries"; // Importamos la nueva función
import { auth } from "@clerk/nextjs/server"; // Para obtener el ID del usuario actual

export const metadata: Metadata = {
    title: "Historial | UniHousing Shipping",
    description: "Registro histórico de envíos gestionados. Consulta detallada de estados anteriores, confirmaciones de entrega y trazabilidad completa de órdenes finalizadas.",
};

// 1. Definición del Mock Data 
export default async function HistoryPage({
    searchParams
}: {
    searchParams: { [key: string]: string | undefined }
}) {
    await requireRole([ROLES.LOGISTICS, ROLES.ADMIN]);

    // 1. Obtenemos el ID del usuario (Clerk) para pasarlo a la query
    const { userId } = await auth();

    // 2. Obtenemos los envíos usando la nueva función
    const allShipments = await getShipmentHistory(userId || "guest");

    // 3. Extracción de filtros
    const currentStatus = searchParams.status || "todos";
    const searchQuery = searchParams.search?.toLowerCase() || "";

    // 4. Lógica de filtrado (Simulación de DB)
    const filteredShipments = allShipments.filter((s) => {
        const matchesStatus = currentStatus === "todos" || s.status === currentStatus;
        const matchesSearch =
            s.shippingId.toLowerCase().includes(searchQuery) ||
            s.deliveryAddress.street.toLowerCase().includes(searchQuery);
        return matchesStatus && matchesSearch;
    });

    // 5. Conteos para Tabs
    const counts = {
        all: allShipments.length,
        active: allShipments.filter(s => s.status !== "delivered").length,
        delivered: allShipments.filter(s => s.status === "delivered").length,
        issues: 0
    };

    return (
        <PageWrapper>
            <HistoryHeader />
            <Content className="p-4 lgx:p-7">
                <HistoryFilters />
                <HistoryTabs counts={counts} />
                <div className="mt-4">
                    <HistoryTable shipments={filteredShipments} />
                </div>
            </Content>
        </PageWrapper>
    );
}