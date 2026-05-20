
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

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
    waiting_for_courier: "En espera",
    pending_pickup: "Todavía no fue retirado",
    picked_up: "Retirado",
    in_transit: "En viaje",
    delivered: "Entregado",
} as const;