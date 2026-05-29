import { z } from "zod";
import { ShippingStatusSchema } from "@/lib/schemas/domain";

// --- Esquemas de dirección ---

export const DestinationAddressSchema = z.object({
    street: z.string().min(1, "La calle es obligatoria"),
    number: z.string().min(1, "El número es obligatorio"),
    zip: z.string().min(1, "El código postal es obligatorio"),
    floor: z.string().optional(),
    apartment: z.string().optional(),
});

// --- Validación: POST /api/shipping/quotes ---

export const quoteRequestSchema = z.object({
    destination_address: DestinationAddressSchema,
    product_id: z.string().min(1, "El ID del producto es obligatorio"),
    weight_kg: z.number().positive("El peso debe ser positivo"),
    height_cm: z.number().positive("La altura debe ser positiva"),
    width_cm: z.number().positive("El ancho debe ser positivo"),
    depth_cm: z.number().positive("La profundidad debe ser positiva"),
});

// --- Validación: POST /api/shipping/quotes/reserve ---

export const reserveQuoteSchema = z.object({
    quote_id: z.string().min(1, "El ID de cotización es obligatorio"),
    order_id: z.string().min(1, "El ID de orden es obligatorio"),
});

// --- Validación: POST /api/shipping/quotes/release ---

export const releaseQuoteSchema = z.object({
    quote_id: z.string().min(1, "El ID de cotización es obligatorio"),
    order_id: z.string().min(1, "El ID de orden es obligatorio"),
});