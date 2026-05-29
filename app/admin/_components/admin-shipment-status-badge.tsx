import { Badge } from "@/components/ui/badge";
import { ADMIN_SHIPMENT_STATUS_LABELS, STATUS_VARIANT_MAP } from "@/lib/constants/shipment";
import type { ShipmentStatus } from "@/lib/constants/shipment";

export function AdminShipmentStatusBadge({ status }: { status: string }) {
    const label = ADMIN_SHIPMENT_STATUS_LABELS[status as ShipmentStatus] ?? status;
    const variant = STATUS_VARIANT_MAP[status as ShipmentStatus] ?? "default";

    return (
        <Badge variant={variant}>
            {label}
        </Badge>
    );
}
