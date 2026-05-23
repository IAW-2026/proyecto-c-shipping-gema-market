import { z } from "zod";

// Body de POST /api/buyer/ordenes/:order_id/estado-envio (consumido por Shipping App).
export const ShippingStatusUpdateSchema = z.object({
  shipping_id: z.string().min(1),
  status: z.enum(["pending_pickup", "in_transit", "delivered", "failed", "cancelled"]),
  tracking_code: z.string().min(1),
  updated_at: z.iso.datetime(),
});

export type ShippingStatusUpdateInput = z.infer<
  typeof ShippingStatusUpdateSchema
>;
