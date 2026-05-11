import { getShipmentHistory } from "@/lib/db/queries/shipments.queries";
import { HistoryTabs } from "./history-tabs";
import { HistoryTable } from "./history-table";

interface HistoryDataProps {
    userId: string;
    currentStatus: string;
    searchQuery: string;
}

export async function HistoryData({ userId, currentStatus, searchQuery }: HistoryDataProps) {
    const allShipments = await getShipmentHistory(userId);

    const filteredShipments = allShipments.filter((s) => {
        const matchesStatus = currentStatus === "todos" || s.status === currentStatus;
        const matchesSearch =
            !searchQuery ||
            s.shippingId.toLowerCase().includes(searchQuery) ||
            s.deliveryAddress.street.toLowerCase().includes(searchQuery);
        return matchesStatus && matchesSearch;
    });

    const counts = {
        all: allShipments.length,
        active: allShipments.filter(s => s.status !== "delivered").length,
        delivered: allShipments.filter(s => s.status === "delivered").length,
        issues: 0
    };

    return (
        <>
            <HistoryTabs counts={counts} />
            <div className="mt-4">
                <HistoryTable shipments={filteredShipments} />
            </div>
        </>
    );
}
