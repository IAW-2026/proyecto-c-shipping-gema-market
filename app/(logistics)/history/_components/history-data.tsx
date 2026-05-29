import { getFilteredShipments } from "@/lib/db/queries/logistics/history";
import { getShipmentCountsByStatus } from "@/lib/db/queries/shared";
import type { ShipmentFilterParams } from "@/lib/types/shipments/filters";
import type { ShipmentStatus } from "@/lib/constants/shipment";
import { HistorySearchParamsSchema } from "@/lib/schemas/api/filters";
import { requireAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { HistoryTabs } from "./history-tabs";
import { HistoryTable } from "./history-table";
import { Pagination } from "@/components/ui/pagination";

function mapTabToFilter(tabId: string): ShipmentStatus[] | undefined {
    switch (tabId) {
        case "todos": return undefined;
        case "active": return ["pending_pickup", "picked_up", "in_transit"];
        case "delivered": return ["delivered"];
        default: return undefined;
    }
}

interface HistoryDataProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function HistoryData({ searchParams }: HistoryDataProps) {
    const user = await requireAuthenticatedUser();

    const raw = await searchParams;
    const parsed = HistorySearchParamsSchema.safeParse(raw);
    if (!parsed.success) {
        return <p className="col-span-full text-center text-ink-3 py-12">Filtros inválidos</p>;
    }
    const params = parsed.data;
    const currentStatus = params.status;
    const searchQuery = params.search;

    const statusFilter = mapTabToFilter(currentStatus);

    const filterParams: ShipmentFilterParams = {
        logisticsId: user.id,
        status: statusFilter,
        query: searchQuery || undefined,
        page: params.page,
        pageSize: params.pageSize,
        sortBy: 'created_at',
        sortOrder: 'desc',
    };

    const [result, countsByStatus] = await Promise.all([
        getFilteredShipments(filterParams),
        getShipmentCountsByStatus(user.id),
    ]);

    const counts = {
        all: countsByStatus.all ?? 0,
        active: (countsByStatus.pending_pickup ?? 0) + (countsByStatus.picked_up ?? 0) + (countsByStatus.in_transit ?? 0),
        delivered: countsByStatus.delivered ?? 0,
    };

    return (
        <>
            <HistoryTabs counts={counts} />
            <div className="mt-4">
                <HistoryTable shipments={result.data} />
                <Pagination currentPage={result.page} totalPages={result.totalPages} />
            </div>
        </>
    );
}
