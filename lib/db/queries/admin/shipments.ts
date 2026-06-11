import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { AdminShipment } from "@/lib/types/admin-dashboard-metrics";
import type { PaginatedResult } from "@/lib/types/shipments/filters";
import { cacheLife } from "next/cache";

export async function getAllShipments(
    status?: string,
    sortBy?: string,
    sortOrder?: string,
    page: number = 1,
    pageSize: number = 20,
    query?: string,
): Promise<PaginatedResult<AdminShipment>> {
    "use cache";
    cacheLife("minutes");

    const where: Prisma.ShipmentWhereInput = {};
    if (status && status !== "all") {
        where.status = status;
    }
    if (query) {
        where.OR = [
            { id: { contains: query, mode: "insensitive" } },
        ];
    }

    const dir = sortOrder === "asc" ? "asc" : "desc";

    const field = sortBy || "created_at";
    const orderBy: Record<string, unknown> = sortBy === "logistics_id"
        ? { operator: { full_name: dir } }
        : { [field]: dir };

    const shipments = await prisma.shipment.findMany({
        where,
        orderBy,
        include: { operator: { select: { full_name: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
    const total = await prisma.shipment.count({ where });

    const mapped = shipments.map((e) => ({
        id: e.id,
        order_id: e.order_id,
        tracking_code: e.tracking_code,
        status: e.status,
        price: Number(e.price),
        logistics_id: e.logistics_id,
        logistics_name: e.operator?.full_name ?? null,
        created_at: e.created_at,
    }));

    if (sortBy === "logistics_id") {
        mapped.sort((a, b) => {
            if (!a.logistics_name && !b.logistics_name) return 0;
            if (!a.logistics_name) return 1;
            if (!b.logistics_name) return -1;
            return dir === "asc"
                ? a.logistics_name.localeCompare(b.logistics_name)
                : b.logistics_name.localeCompare(a.logistics_name);
        });
    }

    return {
        data: mapped,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}

// ─── Admin API queries ───

interface AdminShipmentItem {
    shipping_id: string;
    order_id: string;
    buyer_id: string;
    seller_id: string;
    logistics_id: string | null;
    status: string;
    tracking_code: string;
    price: number;
    picked_up_at: string | null;
    delivered_at: string | null;
    created_at: string;
}

interface AdminShipmentListResult {
    items: AdminShipmentItem[];
    page: number;
    page_size: number;
    total: number;
    sort_by: string;
    order: string;
}

export async function getAdminShipments(
    logisticsId?: string,
    status?: string,
    dateFrom?: string,
    dateTo?: string,
    sortBy: string = "created_at",
    sortOrder: string = "desc",
    page: number = 1,
    pageSize: number = 20,
): Promise<AdminShipmentListResult> {
    "use cache";
    cacheLife("minutes");

    const where: Prisma.ShipmentWhereInput = {};
    if (status) where.status = status;
    if (logisticsId) where.logistics_id = logisticsId;
    if (dateFrom || dateTo) {
        where.created_at = {};
        if (dateFrom) where.created_at.gte = new Date(dateFrom);
        if (dateTo) where.created_at.lte = new Date(dateTo);
    }

    const dir = sortOrder === "asc" ? "asc" : "desc";
    const orderBy: Record<string, unknown> = { [sortBy]: dir };

    const shipments = await prisma.shipment.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
    const total = await prisma.shipment.count({ where });

    const items = shipments.map((s) => ({
        shipping_id: s.id,
        order_id: s.order_id,
        buyer_id: s.buyer_id,
        seller_id: s.seller_id,
        logistics_id: s.logistics_id ?? null,
        status: s.status,
        tracking_code: s.tracking_code,
        price: Number(s.price),
        picked_up_at: s.picked_up_at?.toISOString() ?? null,
        delivered_at: s.delivered_at?.toISOString() ?? null,
        created_at: s.created_at.toISOString(),
    }));

    return {
        items,
        page,
        page_size: pageSize,
        total,
        sort_by: sortBy,
        order: sortOrder,
    };
}

interface AdminShipmentDetail {
    shipping_id: string;
    order_id: string;
    quote_id: string;
    buyer_id: string;
    seller_id: string;
    logistics_id: string | null;
    receiver_name: string;
    receiver_phone: string;
    status: string;
    tracking_code: string;
    price: number;
    pickup_address: unknown;
    delivery_address: unknown;
    pickup_lat: number | null;
    pickup_lng: number | null;
    delivery_lat: number | null;
    delivery_lng: number | null;
    route_distance: number | null;
    route_duration: number | null;
    route_geometry: unknown | null;
    weight: number;
    dimensions: unknown;
    picked_up_at: string | null;
    delivered_at: string | null;
    created_at: string;
}

export async function getAdminShipmentById(shippingId: string): Promise<AdminShipmentDetail | null> {
    "use cache";
    cacheLife("minutes");

    const shipment = await prisma.shipment.findUnique({
        where: { id: shippingId },
    });

    if (!shipment) return null;

    return {
        shipping_id: shipment.id,
        order_id: shipment.order_id,
        quote_id: shipment.quote_id,
        buyer_id: shipment.buyer_id,
        seller_id: shipment.seller_id,
        logistics_id: shipment.logistics_id ?? null,
        receiver_name: shipment.receiver_name,
        receiver_phone: shipment.receiver_phone,
        status: shipment.status,
        tracking_code: shipment.tracking_code,
        price: Number(shipment.price),
        pickup_address: shipment.pickup_address,
        delivery_address: shipment.delivery_address,
        pickup_lat: shipment.pickup_lat ?? null,
        pickup_lng: shipment.pickup_lng ?? null,
        delivery_lat: shipment.delivery_lat ?? null,
        delivery_lng: shipment.delivery_lng ?? null,
        route_distance: shipment.route_distance ?? null,
        route_duration: shipment.route_duration ?? null,
        route_geometry: shipment.route_geometry,
        weight: Number(shipment.weight),
        dimensions: shipment.dimensions,
        picked_up_at: shipment.picked_up_at?.toISOString() ?? null,
        delivered_at: shipment.delivered_at?.toISOString() ?? null,
        created_at: shipment.created_at.toISOString(),
    };
}
