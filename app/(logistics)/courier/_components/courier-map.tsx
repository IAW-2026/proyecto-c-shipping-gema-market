import type { ShipmentSummary } from "@/lib/definitions/shipments";
import { MapIframe } from "@/components/ui/map-iframe";
import { ShipmentStatusBadge } from "@/app/(logistics)/_components/shipment-status-badge";

interface CourierMapProps {
    shipment: ShipmentSummary;
    hasPendingAction?: boolean;
}

export function CourierMap({ shipment, hasPendingAction }: CourierMapProps) {
    return (
        <div className="h-full relative">
            <MapIframe shippingId={shipment.shippingId} className="h-full w-full" />
            <div className={`absolute top-4 left-4 z-[1000] transition-opacity duration-300 ${hasPendingAction ? "opacity-50" : ""}`}>
                <ShipmentStatusBadge status={shipment.status} />
            </div>
        </div>
    );
}
