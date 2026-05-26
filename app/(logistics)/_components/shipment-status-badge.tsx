import { Badge, BadgeProps } from "@/components/ui/badge";
import { ShipmentStatus, SHIPMENT_STATUS_LABELS } from "@/lib/shared/shipment-constants";

const STATUS_VARIANT_MAP: Record<ShipmentStatus, BadgeProps["variant"]> = {
    waiting_for_courier: "neutral",
    pending_pickup: "default",
    picked_up: "warning",
    in_transit: "warning",
    delivered: "success",
};

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
    return (
        <Badge variant={STATUS_VARIANT_MAP[status] || "default"}>
            {SHIPMENT_STATUS_LABELS[status] || "Desconocido"}
        </Badge>
    );
}
