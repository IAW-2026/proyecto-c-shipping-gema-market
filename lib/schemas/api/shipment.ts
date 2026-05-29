import { z } from "zod";
import { ShippingStatusSchema } from "@/lib/schemas/domain";

export const TakeShipmentSchema = z.object({
    shipmentId: z.string().min(1, "El ID del envío es requerido"),
});

export type TakeShipmentInput = z.infer<typeof TakeShipmentSchema>;

export const createShipmentSchema = z.object({
    order_id: z.string().min(1),
    seller_id: z.string().min(1),
    buyer_id: z.string().min(1),
    receiver_name: z.string().optional(),
    receiver_phone: z.string().optional(),
});

export const updateStatusSchema = z.object({
    status: ShippingStatusSchema,
    notes: z.string().optional(),
});

