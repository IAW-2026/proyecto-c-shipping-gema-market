import { Badge } from "@/components/ui/badge";
import { ShipmentStatus, SHIPMENT_STATUS_LABELS, STATUS_VARIANT_MAP } from "@/lib/shared/shipment-constants";

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
    return (
        <Badge variant={STATUS_VARIANT_MAP[status] || "default"}>
            {SHIPMENT_STATUS_LABELS[status] || "Desconocido"}
        </Badge>
    );
}
