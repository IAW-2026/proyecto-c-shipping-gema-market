import dynamic from "next/dynamic";
import type { ShipmentSummary } from "@/lib/definitions/shipment";
import { ShipmentStatusBadge } from "@/app/(operator)/_components/shipment-status-badge";

const MapViewer = dynamic(() => import("@/components/ui/map-viewer"), {
    ssr: false,
});

interface CourierMapProps {
    shipment: ShipmentSummary;
    hasPendingAction?: boolean;
}

export function CourierMap({ shipment, hasPendingAction }: CourierMapProps) {
    return (
        <div className="h-full relative">
            <MapViewer shippingId={shipment.shippingId} />
            <div className={`absolute top-4 left-4 z-[1000] transition-opacity duration-300 ${hasPendingAction ? "opacity-50" : ""}`}>
                <ShipmentStatusBadge status={shipment.status} />
            </div>
        </div>
    );
}
