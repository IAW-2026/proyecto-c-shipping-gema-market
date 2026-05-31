import { z } from "zod";
import { SHIPMENT_STATUSES } from "@/lib/constants/shipment";

export const ShippingStatusSchema = z.enum(SHIPMENT_STATUSES);

export const AddressSchema = z.object({
    street: z.string().min(1, "La calle es obligatoria"),
    number: z.string().min(1, "El número es obligatorio"),
    zip: z.string().min(1, "El código postal es obligatorio"),
    floor: z.string().nullish(),
    apartment: z.string().nullish(),
});

const UserIdSchema = z.string()
    .length(30, "El ID debe tener 30 caracteres")
    .startsWith("usr_", "El ID debe empezar con usr_");

export const ShipmentSchema = z.object({
    shippingId: z.string()
        .length(30, "El ID debe tener 30 caracteres")
        .startsWith("shp_", "El ID debe empezar con shp_"),
    orderId: z.string()
        .length(30, "El ID debe tener 30 caracteres")
        .startsWith("ord_", "El ID debe empezar con ord_"),
    buyerId: UserIdSchema,
    buyerName: z.string().min(1, "El nombre del comprador es obligatorio"),
    receiverPhone: z.string(),
    sellerId: UserIdSchema,
    logisticsId: UserIdSchema,
    status: ShippingStatusSchema,
    trackingCode: z.string(),
    pickupAddress: AddressSchema,
    deliveryAddress: AddressSchema,
    price: z.number().positive("El precio debe ser un valor positivo"),
    pickedUpAt: z.date().nullable(),
    deliveredAt: z.date().nullable(),
    createdAt: z.date().optional(),
    weight: z.number().describe("Peso en kg"),
    height: z.number().int().positive().describe("Altura en cm"),
    width: z.number().int().positive().describe("Ancho en cm"),
    depth: z.number().int().positive().describe("Profundidad en cm"),
    distance: z.number().optional().describe("Distancia calculada en km"),
});

const toIntCm = z.number().transform(v => Math.round(v)).pipe(z.number().int().positive());

export const DimensionsSchema = z.object({
    height: toIntCm.describe("Altura en cm"),
    width: toIntCm.describe("Ancho en cm"),
    depth: toIntCm.describe("Profundidad en cm"),
});

export type ShippingStatus = z.infer<typeof ShippingStatusSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Dimensions = z.infer<typeof DimensionsSchema>;
export type Shipment = z.infer<typeof ShipmentSchema>;

export const ShipmentSummarySchema = ShipmentSchema.pick({
    shippingId: true,
    orderId: true,
    trackingCode: true,
    status: true,
    pickupAddress: true,
    deliveryAddress: true,
    price: true,
    createdAt: true,
    deliveredAt: true,
});

export type ShipmentSummary = z.infer<typeof ShipmentSummarySchema>;

export const CreateShipmentPayloadSchema = ShipmentSchema.omit({
    shippingId: true,
    logisticsId: true,
    status: true,
    trackingCode: true,
    pickedUpAt: true,
    deliveredAt: true,
    createdAt: true,
});

export type CreateShipmentPayload = z.infer<typeof CreateShipmentPayloadSchema>;

export const ShipmentOfferSchema = ShipmentSchema.pick({
    shippingId: true,
    price: true,
    pickupAddress: true,
    deliveryAddress: true,
    weight: true,
    height: true,
    width: true,
    depth: true,
    distance: true,
}).extend({
    estimatedTime: z.string().min(1, "El tiempo estimado es requerido"),
});

export type ShipmentOffer = z.infer<typeof ShipmentOfferSchema>;
