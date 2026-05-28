import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import {
    Shipment, ShipmentSummary, ShipmentOffer,
    ShipmentFilterParams,
    ShippingStatusSchema, AddressSchema, DimensionsSchema,
} from "@/lib/definitions/shipments";
import { cacheLife } from "next/cache";

export const summarySelect = {
    id: true,
    order_id: true,
    tracking_code: true,
    status: true,
    pickup_address: true,
    delivery_address: true,
    price: true,
    created_at: true,
} as const;

export const detailSelect = {
    id: true,
    order_id: true,
    buyer_id: true,
    receiver_name: true,
    receiver_phone: true,
    seller_id: true,
    logistics_id: true,
    status: true,
    tracking_code: true,
    pickup_address: true,
    delivery_address: true,
    price: true,
    picked_up_at: true,
    delivered_at: true,
    created_at: true,
    weight: true,
    dimensions: true,
    route_distance: true,
    route_duration: true,
} as const;

export const offerSelect = {
    id: true,
    price: true,
    pickup_address: true,
    delivery_address: true,
    weight: true,
    dimensions: true,
    route_distance: true,
    route_duration: true,
} as const;

export function buildOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc'): Prisma.EnvioOrderByWithRelationInput {
    const dir = sortOrder ?? 'desc';
    switch (sortBy) {
        case 'price': return { price: dir };
        case 'distance': return { route_distance: dir };
        case 'weight': return { weight: dir };
        case 'tracking_code': return { tracking_code: dir };
        case 'status': return { status: dir };
        default: return { created_at: dir };
    }
}

export function buildWhere(params: ShipmentFilterParams): Prisma.EnvioWhereInput {
    const dateFilter: Record<string, Date> = {};
    if (params.dateFrom) dateFilter.gte = params.dateFrom;
    if (params.dateTo) dateFilter.lte = params.dateTo;

    const where: Record<string, unknown> = {};

    if (params.logisticsId) {
        where.logistics_id = params.logisticsId;
    }

    if (params.status) {
        const statuses = Array.isArray(params.status) ? params.status : [params.status];
        where.status = { in: statuses };
    }

    if (params.query) {
        where.OR = [
            { tracking_code: { contains: params.query, mode: 'insensitive' } },
            { id: { contains: params.query, mode: 'insensitive' } },
        ];
    }

    if (Object.keys(dateFilter).length > 0) {
        where.created_at = dateFilter;
    }

    return where as Prisma.EnvioWhereInput;
}

export function toShipmentSummary(row: {
    id: string;
    order_id: string;
    tracking_code: string;
    status: string;
    pickup_address: unknown;
    delivery_address: unknown;
    price: unknown;
    created_at: Date;
}): ShipmentSummary {
    return {
        shippingId: row.id,
        orderId: row.order_id,
        trackingCode: row.tracking_code,
        status: ShippingStatusSchema.parse(row.status),
        pickupAddress: AddressSchema.parse(row.pickup_address),
        deliveryAddress: AddressSchema.parse(row.delivery_address),
        price: Number(row.price),
        createdAt: row.created_at,
    };
}

export function toShipmentDetail(row: {
    id: string;
    order_id: string;
    buyer_id: string;
    receiver_name: string;
    receiver_phone: string;
    seller_id: string;
    logistics_id: string | null;
    status: string;
    tracking_code: string;
    pickup_address: unknown;
    delivery_address: unknown;
    price: unknown;
    picked_up_at: Date | null;
    delivered_at: Date | null;
    created_at: Date;
    weight: unknown;
    dimensions: unknown;
    route_distance: unknown;
    route_duration: unknown;
}): Shipment {
    const dims = DimensionsSchema.parse(row.dimensions);
    return {
        shippingId: row.id,
        orderId: row.order_id,
        buyerId: row.buyer_id,
        buyerName: row.receiver_name,
        receiverPhone: row.receiver_phone,
        sellerId: row.seller_id,
        logisticsId: row.logistics_id ?? "",
        status: ShippingStatusSchema.parse(row.status),
        trackingCode: row.tracking_code,
        pickupAddress: AddressSchema.parse(row.pickup_address),
        deliveryAddress: AddressSchema.parse(row.delivery_address),
        price: Number(row.price),
        pickedUpAt: row.picked_up_at,
        deliveredAt: row.delivered_at,
        createdAt: row.created_at,
        weight: Number(row.weight),
        height: dims.height,
        width: dims.width,
        depth: dims.depth,
        distance: row.route_distance ? Number(row.route_distance) / 1000 : undefined,
    };
}

export function toShipmentOffer(row: {
    id: string;
    price: unknown;
    pickup_address: unknown;
    delivery_address: unknown;
    weight: unknown;
    dimensions: unknown;
    route_distance: unknown;
    route_duration: unknown;
}): ShipmentOffer {
    const dims = DimensionsSchema.parse(row.dimensions);
    return {
        shippingId: row.id,
        price: Number(row.price),
        pickupAddress: AddressSchema.parse(row.pickup_address),
        deliveryAddress: AddressSchema.parse(row.delivery_address),
        weight: Number(row.weight),
        height: dims.height,
        width: dims.width,
        depth: dims.depth,
        distance: row.route_distance ? Number(row.route_distance) / 1000 : undefined,
        estimatedTime: row.route_duration ? `${Math.round(Number(row.route_duration) / 60)} min` : "",
    };
}

export async function getShipmentCountsByStatus(userId: string): Promise<Record<string, number>> {
    "use cache";
    cacheLife("minutes");

    const counts = await prisma.envio.groupBy({
        by: ['status'],
        where: { logistics_id: userId },
        _count: { id: true },
    });

    const result: Record<string, number> = { all: 0 };
    for (const group of counts) {
        result[group.status] = group._count.id;
        result.all += group._count.id;
    }
    return result;
}

export async function getShipmentCoords(shipmentId: string) {
    return prisma.envio.findUnique({
        where: { id: shipmentId },
        select: {
            pickup_lat: true,
            pickup_lng: true,
            delivery_lat: true,
            delivery_lng: true,
        },
    });
}
