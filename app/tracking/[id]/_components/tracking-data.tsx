import { getShipmentDetails } from "@/lib/db/queries/shipment";
import { notFound } from "next/navigation";
import { TrackingTimeline } from "./tracking-timeline";

export async function TrackingData({ shippingId }: { shippingId: string }) {
    const shipment = await getShipmentDetails(shippingId);

    if (!shipment) notFound();

    return (
        <div className="max-w-lg mx-auto w-full">
            <div className="bg-paper border border-line rounded-r3 p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-ink">Estado del envío</h2>
                    <p className="text-sm text-ink-2 mt-1">
                        Código de seguimiento:{" "}
                        <span className="font-mono font-semibold text-ink">
                            {shipment.trackingCode}
                        </span>
                    </p>
                </div>

                <TrackingTimeline status={shipment.status} />

                <div className="mt-6 pt-4 border-t border-line space-y-2 text-sm text-ink-2">
                    <p>
                        <span className="font-medium text-ink">Origen: </span>
                        {shipment.pickupAddress.street} {shipment.pickupAddress.number}
                        {shipment.pickupAddress.zip ? `, CP ${shipment.pickupAddress.zip}` : ""}
                    </p>
                    <p>
                        <span className="font-medium text-ink">Destino: </span>
                        {shipment.deliveryAddress.street} {shipment.deliveryAddress.number}
                        {shipment.deliveryAddress.zip
                            ? `, CP ${shipment.deliveryAddress.zip}`
                            : ""}
                    </p>
                    {shipment.distance && (
                        <p>
                            <span className="font-medium text-ink">Distancia: </span>
                            {shipment.distance.toFixed(1)} km
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
