import { getAvailableShipments } from "@/lib/db/queries/shipments.queries";
import type { ShipmentFilterParams } from "@/lib/definitions/shipment";
import { AvailableShipmentCard } from "./shipment-card";

interface AvailableDataProps {
    searchQuery?: string;
}

export async function AvailableData({ searchQuery }: AvailableDataProps) {
    const params: ShipmentFilterParams = {
        query: searchQuery || undefined,
    };

    const offers = await getAvailableShipments(params);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.length === 0 ? (
                <p className="col-span-full text-center text-ink-3 py-12">
                    No hay envíos disponibles para tomar en este momento.
                </p>
            ) : (
                offers.map((offer) => (
                    <AvailableShipmentCard
                        key={offer.shippingId}
                        offer={offer}
                    />
                ))
            )}
        </div>
    );
}
