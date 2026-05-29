import { getAvailableShipments } from "@/lib/db/queries/logistics/available";
import type { ShipmentFilterParams } from "@/lib/types/shipments/filters";
import { AvailableShipmentCard } from "./shipment-card";
import { requireAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { AvailableSearchParamsSchema } from "@/lib/schemas/api/filters";
import { Pagination } from "@/components/ui/pagination";

interface AvailableDataProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function AvailableData({ searchParams }: AvailableDataProps) {
    const user = await requireAuthenticatedUser();

    if (user.banned) {
        return (
            <div className="col-span-full text-center py-12">
                <p className="text-red-600 font-semibold text-lg mb-2">
                    Tu cuenta está suspendida
                </p>
                <p className="text-ink-3">
                    No puedes tomar nuevos envíos hasta que un administrador reactive tu cuenta.
                </p>
            </div>
        );
    }

    const raw = await searchParams;
    const parsed = AvailableSearchParamsSchema.safeParse(raw);
    if (!parsed.success) {
        return <p className="col-span-full text-center text-ink-3 py-12">Filtros inválidos</p>;
    }
    const params = parsed.data;

    const filterParams: ShipmentFilterParams = {
        sortBy: params.sortBy as ShipmentFilterParams["sortBy"],
        sortOrder: params.sortOrder,
        weightMin: params.weightMin,
        weightMax: params.weightMax,
        priceMin: params.priceMin,
        priceMax: params.priceMax,
        distanceMin: params.distanceMin,
        distanceMax: params.distanceMax,
        page: params.page,
        pageSize: params.pageSize,
    };

    const result = await getAvailableShipments(filterParams);
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.data.length === 0 ? (
                    <p className="col-span-full text-center text-ink-3 py-12">
                        No hay envíos disponibles para tomar en este momento.
                    </p>
                ) : (
                    result.data.map((offer) => (
                        <AvailableShipmentCard
                            key={offer.shippingId}
                            offer={offer}
                        />
                    ))
                )}
            </div>
            <Pagination currentPage={result.page} totalPages={result.totalPages} />
        </>
    );
}
