"use client";

import dynamic from "next/dynamic";
import type { ShipmentStatus } from "@/lib/shared/shipment-constants";
import { ShipmentStatusBadge } from "@/app/(operator)/_components/shipment-status-badge";
import { Card } from "@/components/ui/card";

const MapViewer = dynamic(() => import("@/components/ui/map-viewer"), {
    ssr: false,
});

interface ShipmentMapProps {
    shippingId: string;
    distance: number;
    status: ShipmentStatus;
}

export function ShipmentMap({ shippingId, distance, status }: ShipmentMapProps) {
    const formattedDistance = `${distance} km`;

    return (
        <Card padding="none" className="overflow-hidden">
            <div className="h-[280px] relative">
                <MapViewer shippingId={shippingId} />
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
