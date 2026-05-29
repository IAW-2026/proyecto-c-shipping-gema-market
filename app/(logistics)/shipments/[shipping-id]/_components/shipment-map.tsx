import type { ShipmentStatus } from "@/lib/constants/shipment";
import { MapIframe } from "@/components/ui/map-iframe";
import { ShipmentStatusBadge } from "@/app/(logistics)/_components/shipment-status-badge";
import { Card } from "@/components/ui/card";

interface ShipmentMapProps {
    shippingId: string;
    distance: number;
    status: ShipmentStatus;
}

export function ShipmentMap({ shippingId, distance, status }: ShipmentMapProps) {
    const formattedDistance = `${distance} km`;

    return (
        <Card padding="none" className="overflow-hidden flex-1">
            <div className="h-full min-h-[280px] relative">
                <MapIframe shippingId={shippingId} className="h-full w-full" />
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-paper/95 rounded-full text-xs font-mono shadow-sm text-ink-2 z-[1000]">
                    {formattedDistance}
                </div>
                <div className="absolute top-4 right-4 z-[1000]">
                    <ShipmentStatusBadge status={status} />
                </div>
            </div>
        </Card>
    );
}
