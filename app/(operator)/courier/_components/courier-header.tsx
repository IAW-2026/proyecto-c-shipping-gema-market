"use client";

import { ShipmentSelector, CancelButton } from "./courier-actions";
import type { ShipmentSummary } from "@/lib/definitions/shipment";

interface CourierHeaderProps {
    shipments: ShipmentSummary[];
    selectedTracking: string;
    onCancelClick: () => void;
    hasPendingAction: boolean;
}

export function CourierHeader({ shipments, selectedTracking, onCancelClick, hasPendingAction }: CourierHeaderProps) {
    return (
        <header className="px-4 lgx:px-7 pt-8 pb-4 flex flex-wrap justify-between items-center gap-4 border-b border-line mb-6 bg-paper min-h-[100px]">
            <ShipmentSelector shipments={shipments} selectedTracking={selectedTracking} />
            <CancelButton onClick={onCancelClick} disabled={hasPendingAction} />
        </header>
    );
}
