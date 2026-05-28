
/**
 * Single Source of Truth (SSOT) para los estados lógicos de la aplicación.
 * Utilizamos 'as const' para que TypeScript lo trate como una tupla inmutable literal,
 * lo cual es un requisito estricto para integrarlo con Zod y ORMs.
 */
export const SHIPMENT_STATUSES = [
    'waiting_for_courier',
    'pending_pickup',
    'picked_up',
    'in_transit',
    'delivered',
] as const;

export type ShipmentStatus = typeof SHIPMENT_STATUSES[number];

export const ADMIN_DAYS = 1;
export const SECONDS_PER_TRANSIT_DAY = 28800;
export const MAX_TRANSIT_DAYS = 5;

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
    waiting_for_courier: "En espera",
    pending_pickup: "Todavía no fue retirado",
    picked_up: "Retirado",
    in_transit: "En viaje",
    delivered: "Entregado",
} as const;

export const ADMIN_SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
    waiting_for_courier: "Esperando repartidor",
    pending_pickup: "Pendiente de retiro",
    picked_up: "Retirado",
    in_transit: "En viaje",
    delivered: "Entregado",
} as const;

export const STATUS_VARIANT_MAP: Record<ShipmentStatus, "default" | "success" | "warning" | "danger" | "neutral"> = {
    waiting_for_courier: "neutral",
    pending_pickup: "default",
    picked_up: "warning",
    in_transit: "warning",
    delivered: "success",
} as const;

type CourierActionTransition = "pickup" | "transit" | "deliver";

export const COURIER_ACTION_MAP: Record<
    ShipmentStatus,
    { label: string; transition: CourierActionTransition; canCancel: boolean } | null
> = {
    waiting_for_courier: null,
    pending_pickup: { label: "Recoger paquete", transition: "pickup", canCancel: true },
    picked_up: { label: "Iniciar viaje", transition: "transit", canCancel: false },
    in_transit: { label: "Marcar entregado", transition: "deliver", canCancel: false },
    delivered: null,
} as const;