// lib/validations/shipment.ts
import { z } from "zod";

export const TakeShipmentSchema = z.object({
    shipmentId: z.string().min(1, "El ID del envío es requerido"),
});

export type TakeShipmentInput = z.infer<typeof TakeShipmentSchema>;