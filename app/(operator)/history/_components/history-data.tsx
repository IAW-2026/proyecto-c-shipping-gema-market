import { getFilteredShipments, getShipmentCountsByStatus } from "@/lib/db/queries/shipments.queries";
import type { ShipmentFilterParams } from "@/lib/definitions/shipment";
import type { ShipmentStatus } from "@/lib/shared/shipment-constants";
import { HistoryTabs } from "./history-tabs";
import { HistoryTable } from "./history-table";
import { Pagination } from "@/components/ui/pagination";

function mapTabToFilter(tabId: string): ShipmentStatus[] | undefined {
    switch (tabId) {
        case "todos": return undefined;
        case "active": return ["pending_pickup", "in_transit"];
        case "delivered": return ["delivered"];
        case "issues": return ["failed", "cancelled"];
        default: return undefined;
    }
}

interface HistoryDataProps {
    userId: string;
    currentStatus: string;
    searchQuery: string;
    page: number;
    pageSize: number;
}

export async function HistoryData({ userId, currentStatus, searchQuery, page, pageSize }: HistoryDataProps) {
    const statusFilter = mapTabToFilter(currentStatus);

    const params: ShipmentFilterParams = {
        logisticsId: userId,
        status: statusFilter,
        query: searchQuery || undefined,
        page,
        pageSize,
        sortBy: 'created_at',
        sortOrder: 'desc',
    };

    const [result, countsByStatus] = await Promise.all([
        getFilteredShipments(params),
        getShipmentCountsByStatus(userId),
    ]);

    const counts = {
        all: countsByStatus.todos ?? 0,
        active: (countsByStatus.pending_pickup ?? 0) + (countsByStatus.in_transit ?? 0),
        delivered: countsByStatus.delivered ?? 0,
        issues: (countsByStatus.failed ?? 0) + (countsByStatus.cancelled ?? 0),
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
