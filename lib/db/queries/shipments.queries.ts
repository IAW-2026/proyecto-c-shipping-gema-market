import prisma from "@/lib/db/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
    Shipment, ShipmentSummary, ShipmentOffer,
    ShipmentFilterParams, PaginatedResult,
    ShippingStatusSchema, AddressSchema, DimensionsSchema,
} from "@/lib/definitions/shipment";

// --- Selectores reutilizables ---

const summarySelect = {
    id: true,
    order_id: true,
    tracking_code: true,
    status: true,
    pickup_address: true,
    delivery_address: true,
    price: true,
    created_at: true,
} as const;

const detailSelect = {
    id: true,
    order_id: true,
    buyer_id: true,
    receiver_name: true,
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
} as const;

const offerSelect = {
    id: true,
    price: true,
    pickup_address: true,
    delivery_address: true,
    weight: true,
    dimensions: true,
} as const;

// --- Utilidades de construcción de consultas ---

function buildOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc'): Prisma.EnvioOrderByWithRelationInput {
    const dir = sortOrder ?? 'desc';
    switch (sortBy) {
        case 'price': return { price: dir };
        case 'tracking_code': return { tracking_code: dir };
        case 'status': return { status: dir };
        default: return { created_at: dir };
    }
}

function buildWhere(params: ShipmentFilterParams): Prisma.EnvioWhereInput {
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

// --- Mapeadores DB → Dominio ---

function toShipmentSummary(row: {
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

function toShipmentDetail(row: {
    id: string;
    order_id: string;
    buyer_id: string;
    receiver_name: string;
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
}): Shipment {
    const dims = DimensionsSchema.parse(row.dimensions);
    return {
        shippingId: row.id,
        orderId: row.order_id,
        buyerId: row.buyer_id,
        buyerName: row.receiver_name,
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
        distance: undefined,
    };
}

function toShipmentOffer(row: {
    id: string;
    price: unknown;
    pickup_address: unknown;
    delivery_address: unknown;
    weight: unknown;
    dimensions: unknown;
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
        distance: undefined,
        estimatedTime: "",
    };
}

// --- Funciones públicas del DAO ---

export async function getShipmentDetails(shippingId: string): Promise<Shipment | null> {
    const envio = await prisma.envio.findUnique({
        where: { id: shippingId },
        select: detailSelect,
    });

    if (!envio) return null;
    return toShipmentDetail(envio);
}

export async function getFilteredShipments(params: ShipmentFilterParams): Promise<PaginatedResult<ShipmentSummary>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const where = buildWhere(params);
    const orderBy = buildOrderBy(params.sortBy, params.sortOrder);

    const [data, total] = await Promise.all([
        prisma.envio.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: summarySelect,
        }),
        prisma.envio.count({ where }),
    ]);

    return {
        data: data.map(toShipmentSummary),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}

export async function getShipmentHistory(userId: string): Promise<ShipmentSummary[]> {
    const envios = await prisma.envio.findMany({
        where: { logistics_id: userId },
        orderBy: { created_at: 'desc' },
        select: summarySelect,
    });

    return envios.map(toShipmentSummary);
}

export async function getAvailableShipments(params?: ShipmentFilterParams): Promise<ShipmentOffer[]> {
    const where: Prisma.EnvioWhereInput = {
        status: 'pending_pickup',
        logistics_id: null,
    };

    if (params?.query) {
        where.OR = [
            { tracking_code: { contains: params.query, mode: 'insensitive' } },
            { id: { contains: params.query, mode: 'insensitive' } },
        ];
    }

    const orderBy = params?.sortBy
        ? buildOrderBy(params.sortBy, params.sortOrder)
        : { created_at: 'desc' as const };

    const envios = await prisma.envio.findMany({
        where,
        orderBy,
        select: offerSelect,
    });

    return envios.map(toShipmentOffer);
}

export async function getShipmentCountsByStatus(userId: string): Promise<Record<string, number>> {
    const counts = await prisma.envio.groupBy({
        by: ['status'],
        where: { logistics_id: userId },
        _count: { id: true },
    });

    const result: Record<string, number> = { todos: 0 };
    for (const group of counts) {
        result[group.status] = group._count.id;
        result.todos += group._count.id;
    }
    return result;
}
