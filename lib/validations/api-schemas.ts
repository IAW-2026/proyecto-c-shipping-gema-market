import { z } from "zod";

// Validación para el endpoint POST /api/shipping/envios
export const createShipmentSchema = z.object({
    order_id: z.string().min(1),
    seller_id: z.string().min(1),
    buyer_id: z.string().min(1),
});

// Validación para actualizaciones de estado internas
export const updateStatusSchema = z.object({
    status: z.enum(['pending_pickup', 'in_transit', 'delivered', 'failed', 'cancelled']),
    notes: z.string().optional(),
});