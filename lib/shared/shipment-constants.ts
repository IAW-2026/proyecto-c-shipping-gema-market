
/**
 * Single Source of Truth (SSOT) para los estados lógicos de la aplicación.
 * Utilizamos 'as const' para que TypeScript lo trate como una tupla inmutable literal,
 * lo cual es un requisito estricto para integrarlo con Zod y ORMs.
 */
export const SHIPMENT_STATUSES = [
    'pending_pickup',
    'in_transit',
    'delivered',
    'failed',
    'cancelled'
] as const;

/**
 * Tipo inferido para uso en interfaces, Server Actions y componentes React.
 * Tipo resultante: 'pending_pickup' | 'in_transit' | 'delivered' | 'failed' | 'cancelled'
 */
export type ShipmentStatus = typeof SHIPMENT_STATUSES[number];

/**
 * Diccionario de mapeo para la UI (Frontend).
 */
export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
    pending_pickup: "Pendiente de retiro",
    in_transit: "En camino",
    delivered: "Entregado",
    failed: "Intento fallido",
    cancelled: "Cancelado",
} as const;