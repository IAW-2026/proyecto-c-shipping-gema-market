import { z } from "zod";
import { ShippingStatusSchema } from "../definitions/shipment";

// Validación para el endpoint POST /api/shipping/envios
export const createShipmentSchema = z.object({
    order_id: z.string().min(1),
    seller_id: z.string().min(1),
    buyer_id: z.string().min(1),
});

// Validación para actualizaciones de estado internas
export const updateStatusSchema = z.object({
    status: ShippingStatusSchema,
    notes: z.string().optional(),
});

// Validación para cotizaciones externas
export const quoteRequestSchema = z.object({
    origin_zip: z.string().min(4),
    destination_zip: z.string().min(4),
    weight_kg: z.number().positive(),
});