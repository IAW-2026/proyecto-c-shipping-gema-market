import { ShipmentStatus } from "@/lib/shared/shipment-constants";
import { Card } from "@/components/ui/card";
import { ShipmentStatusBadge } from "@/app/(operator)/_components/shipment-status-badge";

interface ShipmentMapPlaceholderProps {
    distance: number;
    status: ShipmentStatus;
}

export function ShipmentMapPlaceholder({ distance, status }: ShipmentMapPlaceholderProps) {
    const formattedDistance = `${distance} km`;

    return (
        <Card padding="none" className="overflow-hidden">
            <div className="h-[280px] relative bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                {/* Visual placeholder para futura integración de mapas */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-400 via-transparent to-transparent pointer-events-none" />
                <div className="text-center p-4">
                    <p className="text-sm font-medium text-slate-500 mb-2">Map Placeholder</p>
                    <p className="text-xs text-slate-400">Futura integración de librería de mapas</p>
                </div>
                
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-paper/95 rounded-full text-xs font-mono shadow-sm">
                    {formattedDistance}
                </div>
                <div className="absolute top-4 right-4">
                    <ShipmentStatusBadge status={status} />
                </div>
            </div>
        </Card>
    );
}
