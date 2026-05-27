import { getFilteredShipments, getShipmentCountsByStatus } from "@/lib/db/queries/shipment";
import type { ShipmentFilterParams } from "@/lib/definitions/shipments";
import type { ShipmentStatus } from "@/lib/shared/shipment-constants";
import { HistorySearchParamsSchema } from "@/lib/validations/shipment";
import { getAuthenticatedUserId } from "@/lib/auth/get-authenticated-user";
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
    const user = await getAuthenticatedUserId();
    if (!user) return null;

    const raw = await searchParams;
    const params = HistorySearchParamsSchema.parse(raw);
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
        all: countsByStatus.todos ?? 0,
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
