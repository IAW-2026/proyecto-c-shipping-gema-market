import { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/shared/auth-constants";
import { HistoryFilters } from "./_components/history-filters";
import { ShipmentStatusBadge } from "../_components/shipment-status-badge";
import { ChevronRight } from "lucide-react";
import { PageWrapper, Content } from "../_components/page-layout";
import { HistoryHeader } from "./_components/history-header";
import { HistoryTabs } from "./_components/history-tabs";
import { HistoryTable } from "./_components/history-table";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Historial | UniHousing Shipping",
    description: "Registro histórico de envíos gestionados. Consulta detallada de estados anteriores, confirmaciones de entrega y trazabilidad completa de órdenes finalizadas.",
};

const MOCK_SHIPMENTS = [
    { id: "TRK-9821", order: "OR-2841", status: "delivered", to: "Av. Alem 1253, Bahía Blanca", price: 2400 },
    { id: "TRK-9819", order: "OR-2839", status: "delivered", to: "Brown 510, Bahía Blanca", price: 1200 },
    { id: "TRK-9820", order: "OR-2840", status: "pending_pickup", to: "Donado 845, Bahía Blanca", price: 1800 },
];
// 1. Definición del Mock Data 
export default async function HistoryPage({
    searchParams
}: {
    searchParams: { [key: string]: string | undefined }
}) {
    // 2. Seguridad Perimetral: Validación de roles permitidos
    await requireRole([ROLES.LOGISTICS, ROLES.ADMIN]);

    // 3. Extracción de filtros desde la URL
    const currentStatus = searchParams.status || "todos";
    const searchQuery = searchParams.search?.toLowerCase() || "";

    // 4. Lógica de filtrado en el Servidor
    // Esto simula la cláusula WHERE de PostgreSQL para la Etapa 3
    const filteredShipments = MOCK_SHIPMENTS.filter((s) => {
        const matchesStatus = currentStatus === "todos" || s.status === currentStatus;
        const matchesSearch = s.id.toLowerCase().includes(searchQuery) ||
            s.to.toLowerCase().includes(searchQuery);
        return matchesStatus && matchesSearch;
    });

    // 5. Cálculo de conteos para las pestañas (Tabs)
    const counts = {
        all: MOCK_SHIPMENTS.length,
        active: MOCK_SHIPMENTS.filter(s => s.status !== "delivered").length,
        delivered: MOCK_SHIPMENTS.filter(s => s.status === "delivered").length,
        issues: 0 // Placeholder para lógica de errores logísticos
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