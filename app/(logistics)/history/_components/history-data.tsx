import { getFilteredShipments } from "@/lib/db/queries/logistics/history";
import type { ShipmentFilterParams } from "@/lib/types/shipments/filters";
import { HistorySearchParamsSchema } from "@/lib/schemas/api/filters";
import { requireAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { HistoryTable } from "./history-table";
import { Pagination } from "@/components/ui/pagination";

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
    const searchQuery = params.search;

    const filterParams: ShipmentFilterParams = {
        logisticsId: user.id,
        status: ["delivered"],
        query: searchQuery || undefined,
        page: params.page,
        pageSize: params.pageSize,
        sortBy: 'delivered_at',
        sortOrder: 'desc',
    };

    const result = await getFilteredShipments(filterParams);

    return (
        <div className="mt-4">
            <HistoryTable shipments={result.data} />
            <Pagination currentPage={result.page} totalPages={result.totalPages} />
        </div>
    );
}
