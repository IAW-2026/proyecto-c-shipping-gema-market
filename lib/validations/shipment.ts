// lib/validations/shipment.ts
import { z } from "zod";

export const TakeShipmentSchema = z.object({
    shipmentId: z.string().min(1, "El ID del envío es requerido"),
});

export type TakeShipmentInput = z.infer<typeof TakeShipmentSchema>;

export const HistorySearchParamsSchema = z.object({
    status: z.string().optional().default('todos'),
    search: z.string().optional().default(''),
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().optional().default(20),
    sortBy: z.enum(['created_at', 'price', 'tracking_code', 'status']).optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type HistorySearchParams = z.infer<typeof HistorySearchParamsSchema>;

export const AvailableSearchParamsSchema = z.object({
    search: z.string().optional().default(''),
    sortBy: z.enum(['price', 'distance', 'created_at']).optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type AvailableSearchParams = z.infer<typeof AvailableSearchParamsSchema>;

