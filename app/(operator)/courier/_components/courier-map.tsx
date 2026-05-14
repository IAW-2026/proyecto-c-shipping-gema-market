import type { ShipmentSummary } from "@/lib/definitions/shipment";
import { ShipmentStatusBadge } from "@/app/(operator)/_components/shipment-status-badge";

interface CourierMapProps {
    shipment: ShipmentSummary;
}

export function CourierMap({ shipment }: CourierMapProps) {
    return (
        <div className="h-full relative bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-400 via-transparent to-transparent pointer-events-none" />

            <div className="text-center p-4">
                <p className="text-sm font-medium text-slate-500 mb-2">Map Placeholder</p>
                <p className="text-xs text-slate-400">Futura integración de librería de mapas</p>
            </div>

            <div className="absolute top-4 left-4">
                <ShipmentStatusBadge status={shipment.status} />
            </div>
        </div>
    );
}
