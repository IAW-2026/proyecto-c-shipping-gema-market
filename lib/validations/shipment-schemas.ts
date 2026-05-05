import { z } from "zod";
import { SHIPMENT_STATUSES } from "../shared/shipment-constants";

export const UpdateShipmentSchema = z.object({
    shipmentId: z.string().min(1, "El ID del envío es requerido"),
    orderId: z.string().min(1, "El ID de la orden es requerido"),
    trackingCode: z.string().min(1, "El código de seguimiento es requerido"),

    // Zod consume directamente la tupla inmutable exportada
    status: z.enum([...SHIPMENT_STATUSES] as [string, ...string[]], {
        error: (issue: any) => {
            if (issue.code === "invalid_enum_value") {
                return { message: "El estado logístico proporcionado no es válido." };
            }
            if (issue.code === "invalid_type" && issue.received === "undefined") {
                return { message: "El estado logístico es obligatorio." };
            }
            return { message: issue.message || "Error de validación" };
        },
    }),
});

export type UpdateShipmentInput = z.infer<typeof UpdateShipmentSchema>;