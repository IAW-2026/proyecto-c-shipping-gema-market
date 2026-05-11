import { getShipmentOffers } from "@/lib/db/queries/shipments.queries";
import { AvailableShipmentCard } from "./shipment-card";

export async function AvailableData() {
    const offers = await getShipmentOffers();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
                <AvailableShipmentCard
                    key={offer.shippingId}
                    offer={offer}
                />
            ))}
        </div>
    );
}
