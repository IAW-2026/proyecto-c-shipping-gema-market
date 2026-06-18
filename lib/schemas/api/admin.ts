import { z } from "zod";
import { SHIPMENT_STATUSES } from "@/lib/constants/shipment";

// ─── Query params ───

export const AdminShipmentsQuerySchema = z.object({
    logistics_id: z.string().optional(),
    status: z.enum(SHIPMENT_STATUSES).optional(),
    date_from: z.string().datetime().optional(),
    date_to: z.string().datetime().optional(),
    sort_by: z.enum(["created_at", "price", "status"]).default("created_at"),
    order: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
});

export const AdminDriversQuerySchema = z.object({
    q: z.string().optional(),
    banned: z.enum(["true", "false"]).optional(),
    sort_by: z.enum(["created_at", "full_name"]).default("created_at"),
    order: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
});

export const AdminUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
    sort_by: z.enum(["created_at"]).default("created_at"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

export const AdminStatsQuerySchema = z.object({
    date_from: z.string().datetime().optional(),
    date_to: z.string().datetime().optional(),
});

export const AdminTimeseriesQuerySchema = z.object({
    date_from: z.string().datetime(),
    date_to: z.string().datetime(),
    granularity: z.enum(["day", "week", "month"]).default("day"),
    metric: z.enum(["shipments", "delivered"]).default("shipments"),
});

// ─── Request body ───

export const AdminPatchShipmentBodySchema = z.object({
    logistics_id: z.string().nullable().optional(),
});

export const AdminPatchDriverBodySchema = z.object({
    banned: z.boolean(),
});

// ─── Response item schemas ───

export const AdminShipmentItemSchema = z.object({
    shipping_id: z.string(),
    order_id: z.string(),
    buyer_id: z.string(),
    seller_id: z.string(),
    logistics_id: z.string().nullable(),
    status: z.string(),
    tracking_code: z.string(),
    price: z.number(),
    picked_up_at: z.string().nullable(),
    delivered_at: z.string().nullable(),
    created_at: z.string(),
});

export const AdminShipmentDetailSchema = z.object({
    shipping_id: z.string(),
    order_id: z.string(),
    quote_id: z.string(),
    buyer_id: z.string(),
    seller_id: z.string(),
    logistics_id: z.string().nullable(),
    receiver_name: z.string(),
    receiver_phone: z.string(),
    status: z.string(),
    tracking_code: z.string(),
    price: z.number(),
    pickup_address: z.record(z.string(), z.unknown()),
    delivery_address: z.record(z.string(), z.unknown()),
    pickup_lat: z.number().nullable(),
    pickup_lng: z.number().nullable(),
    delivery_lat: z.number().nullable(),
    delivery_lng: z.number().nullable(),
    route_distance: z.number().nullable(),
    route_duration: z.number().nullable(),
    route_geometry: z.record(z.string(), z.unknown()).nullable(),
    weight: z.number(),
    dimensions: z.record(z.string(), z.unknown()),
    picked_up_at: z.string().nullable(),
    delivered_at: z.string().nullable(),
    created_at: z.string(),
});

export const AdminDriverItemSchema = z.object({
    user_id: z.string(),
    full_name: z.string(),
    email: z.string(),
    banned: z.boolean(),
    active_shipments: z.number(),
    created_at: z.string(),
});

export const AdminUserItemSchema = z.object({
    user_id: z.string(),
    clerk_user_id: z.string(),
    email: z.string(),
    full_name: z.string(),
    role: z.string(),
    banned: z.boolean(),
    created_at: z.string(),
});

export const AdminStatsResponseSchema = z.object({
    total_shipments: z.number(),
    shipments_by_status: z.record(z.string(), z.number()),
    average_delivery_hours: z.number().nullable(),
    on_time_rate: z.number(),
});

export const AdminTimeseriesResponseSchema = z.object({
    granularity: z.string(),
    series: z.array(z.object({
        bucket: z.string(),
        value: z.number(),
    })),
});
