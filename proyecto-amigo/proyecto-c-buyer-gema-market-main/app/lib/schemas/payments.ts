import { z } from "zod";

// Body de POST /api/buyer/pagos/:payment_id/confirmado (consumido por Payments App).
export const PaymentConfirmedSchema = z.object({
  payment_id: z.string().min(1),
  orders: z
    .array(
      z.object({
        order_id: z.string().min(1),
        mp_payment_id: z.string().min(1),
        status: z.literal("approved"),
        amount: z.number().positive(),
        currency: z.string().min(1),
        paid_at: z.iso.datetime(),
      })
    )
    .min(1, "orders no puede estar vacío"),
});

// Body de POST /api/buyer/pagos/:payment_id/rechazado (consumido por Payments App).
export const PaymentRejectedSchema = z.object({
  payment_id: z.string().min(1),
  orders: z
    .array(
      z.object({
        order_id: z.string().min(1),
        status: z.literal("rejected"),
        reason: z.string().min(1),
      })
    )
    .min(1, "orders no puede estar vacío"),
});

export type PaymentConfirmedInput = z.infer<typeof PaymentConfirmedSchema>;
export type PaymentRejectedInput = z.infer<typeof PaymentRejectedSchema>;
