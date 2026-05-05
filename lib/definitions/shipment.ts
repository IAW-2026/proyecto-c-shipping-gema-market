import { z } from "zod";

// 1. Esquemas Base
export const ShippingStatusSchema = z.enum([
    'pending_pickup',
    'in_transit',
    'delivered',
    'failed',
    'cancelled'
]);

export const AddressSchema = z.object({
    street: z.string().min(1, "La calle es obligatoria"),
    number: z.string().min(1, "El número es obligatorio"),
    zip: z.string().min(1, "El código postal es obligatorio"),
    floor: z.string().optional(),
    apartment: z.string().optional(),
});

// 2. Esquema Principal del Dominio (Alineado 100% al modelo de BD)
export const ShipmentSchema = z.object({
    id: z.string().length(26, "El ID debe ser un ULID válido"), // ULID
    orderId: z.string(), // FK lógica a Buyer App
    buyerId: z.string(),
    sellerId: z.string(),
    logisticsId: z.string().nullable(), // FK al usuario operador
    status: ShippingStatusSchema,
    trackingCode: z.string(),
    pickupAddress: AddressSchema, // Se almacenará como JSON en PostgreSQL
    deliveryAddress: AddressSchema, // Se almacenará como JSON en PostgreSQL
    price: z.number().positive(),
    pickedUpAt: z.date().nullable(),
    deliveredAt: z.date().nullable(),
    createdAt: z.date().optional(), // Autogenerado por BD
});

// 3. Inferencia de Tipos (Reemplaza tus interfaces manuales)
export type ShippingStatus = z.infer<typeof ShippingStatusSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Shipment = z.infer<typeof ShipmentSchema>;

// 4. Esquemas para DTOs (Data Transfer Objects)
// DTO para las vistas de lista (ShipmentSummary)
export const ShipmentSummarySchema = ShipmentSchema.pick({
    id: true,
    orderId: true,
    trackingCode: true,
    status: true,
    pickupAddress: true,
    deliveryAddress: true,
    price: true,
    createdAt: true,
});

export type ShipmentSummary = z.infer<typeof ShipmentSummarySchema>;

// DTO para validar el POST que recibiremos de la Seller App al crear un envío
export const CreateShipmentPayloadSchema = ShipmentSchema.omit({
    id: true,
    logisticsId: true,
    status: true,
    trackingCode: true,
    pickedUpAt: true,
    deliveredAt: true,
    createdAt: true,
});

export type CreateShipmentPayload = z.infer<typeof CreateShipmentPayloadSchema>;