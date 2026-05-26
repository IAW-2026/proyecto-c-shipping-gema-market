import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import {
    Shipment, ShipmentSummary, ShipmentOffer,
    ShipmentFilterParams, PaginatedResult,
    ShippingStatusSchema, AddressSchema, DimensionsSchema,
} from "@/lib/definitions/shipments";

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

const offerSelect = {
    id: true,
    price: true,
    pickup_address: true,
    delivery_address: true,
    weight: true,
    dimensions: true,
    route_distance: true,
    route_duration: true,
} as const;

function buildOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc'): Prisma.EnvioOrderByWithRelationInput {
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

function toShipmentOffer(row: {
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

export async function getShipmentDetails(shippingId: string): Promise<Shipment | null> {
    const envio = await prisma.envio.findUnique({
        where: { id: shippingId },
        select: detailSelect,
    });

    if (!envio) return null;
    return toShipmentDetail(envio);
}

export async function getShipmentByTrackingCode(code: string): Promise<Shipment | null> {
    const envio = await prisma.envio.findUnique({
        where: { tracking_code: code },
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
        status: 'waiting_for_courier',
        logistics_id: null,
    };

    if (params?.query) {
        where.OR = [
            { tracking_code: { contains: params.query, mode: 'insensitive' } },
            { id: { contains: params.query, mode: 'insensitive' } },
        ];
    }

    const rangeFilters: Prisma.EnvioWhereInput[] = [];
    if (params?.weightMin !== undefined || params?.weightMax !== undefined) {
        const wf: { gte?: number; lte?: number } = {};
        if (params.weightMin !== undefined) wf.gte = params.weightMin;
        if (params.weightMax !== undefined) wf.lte = params.weightMax;
        rangeFilters.push({ weight: wf });
    }
    if (params?.priceMin !== undefined || params?.priceMax !== undefined) {
        const pf: { gte?: number; lte?: number } = {};
        if (params.priceMin !== undefined) pf.gte = params.priceMin;
        if (params.priceMax !== undefined) pf.lte = params.priceMax;
        rangeFilters.push({ price: pf });
    }
    if (params?.distanceMin !== undefined || params?.distanceMax !== undefined) {
        const df: { gte?: number; lte?: number } = {};
        if (params.distanceMin !== undefined) df.gte = params.distanceMin * 1000;
        if (params.distanceMax !== undefined) df.lte = params.distanceMax * 1000;
        rangeFilters.push({ route_distance: df });
    }
    if (rangeFilters.length > 0) {
        where.AND = rangeFilters;
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

export async function getEnvioCoords(envioId: string) {
  return prisma.envio.findUnique({
    where: { id: envioId },
    select: {
      pickup_lat: true,
      pickup_lng: true,
      delivery_lat: true,
      delivery_lng: true,
    },
  });
}

export async function persistRouteGeometry(
  envioId: string,
  routeGeometry: Prisma.InputJsonValue
): Promise<void> {
  await prisma.envio.update({
    where: { id: envioId },
    data: { route_geometry: routeGeometry },
  });
}

export interface CreateEnvioData {
  id: string;
  order_id: string;
  quote_id: string;
  buyer_id: string;
  seller_id: string;
  receiver_name: string;
  receiver_phone: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  pickup_address: Prisma.InputJsonValue;
  delivery_address: Prisma.InputJsonValue;
  tracking_code: string;
  price: Prisma.Decimal | number;
  pickup_lat: number | null;
  pickup_lng: number | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  route_distance: number | null;
  route_duration: number | null;
}

export async function createEnvioRecord(data: CreateEnvioData) {
  return prisma.envio.create({
    data: {
      id: data.id,
      order_id: data.order_id,
      quote_id: data.quote_id,
      buyer_id: data.buyer_id,
      receiver_name: data.receiver_name,
      receiver_phone: data.receiver_phone,
      seller_id: data.seller_id,
      weight: data.weight,
      dimensions: data.dimensions,
      pickup_address: data.pickup_address,
      delivery_address: data.delivery_address,
      tracking_code: data.tracking_code,
      status: "waiting_for_courier",
      price: data.price,
      pickup_lat: data.pickup_lat,
      pickup_lng: data.pickup_lng,
      delivery_lat: data.delivery_lat,
      delivery_lng: data.delivery_lng,
      route_geometry: Prisma.DbNull,
      route_distance: data.route_distance,
      route_duration: data.route_duration,
    },
  });
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
