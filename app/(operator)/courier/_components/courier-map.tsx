import dynamic from "next/dynamic";
import type { ShipmentSummary } from "@/lib/definitions/shipment";
import { ShipmentStatusBadge } from "@/app/(operator)/_components/shipment-status-badge";

const MapViewer = dynamic(() => import("@/components/ui/map-viewer"), {
    ssr: false,
});

interface CourierMapProps {
    shipment: ShipmentSummary;
}

export function CourierMap({ shipment }: CourierMapProps) {
    return (
        <div className="h-full relative">
            <MapViewer shippingId={shipment.shippingId} />
            <div className="absolute top-4 left-4 z-[1000]">
                <ShipmentStatusBadge status={shipment.status} />
            </div>
        </div>
    );
}
