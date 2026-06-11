import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { AdminDriver, AdminDriverDetail, DriverShipment } from "@/lib/types/admin-dashboard-metrics";
import type { PaginatedResult } from "@/lib/types/shipments/filters";
import { cacheLife } from "next/cache";

export async function getAllDrivers(
    query?: string,
    bannedFilter?: "all" | "banned" | "active",
    page: number = 1,
    pageSize: number = 20,
): Promise<PaginatedResult<AdminDriver>> {
    "use cache";
    cacheLife("minutes");

    const where: Prisma.UserWhereInput = { role: "logistics" };
    if (query) where.full_name = { contains: query, mode: "insensitive" };
    if (bannedFilter === "banned") where.banned = true;
    else if (bannedFilter === "active") where.banned = false;

    const drivers = await prisma.user.findMany({
        where,
        include: { _count: { select: { shipments: true } } },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
    const total = await prisma.user.count({ where });

    return {
        data: drivers.map((d) => ({
            id: d.id,
            full_name: d.full_name,
            email: d.email,
            role: d.role,
            banned: d.banned,
            created_at: d.created_at,
            totalShipments: d._count.shipments,
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}

export async function getDriverById(driverId: string): Promise<Omit<AdminDriverDetail, "shipments"> | null> {
    "use cache";
    cacheLife("minutes");

    const driver = await prisma.user.findUnique({
        where: { id: driverId },
    });

    if (!driver) return null;

    return {
        id: driver.id,
        full_name: driver.full_name,
        email: driver.email,
        role: driver.role,
        banned: driver.banned,
        created_at: driver.created_at,
    };
}

export async function getDriverShipments(
    driverId: string,
    page: number = 1,
    pageSize: number = 20,
): Promise<PaginatedResult<DriverShipment>> {
    "use cache";
    cacheLife("minutes");

    const where: Prisma.ShipmentWhereInput = { logistics_id: driverId };

    const shipments = await prisma.shipment.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
    const total = await prisma.shipment.count({ where });

    return {
        data: shipments.map((e) => ({
            id: e.id,
            order_id: e.order_id,
            tracking_code: e.tracking_code,
            status: e.status,
            price: Number(e.price),
            created_at: e.created_at,
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}

// ─── Admin API queries ───

interface AdminDriverItem {
    user_id: string;
    full_name: string;
    email: string;
    banned: boolean;
    active_shipments: number;
    created_at: string;
}

interface AdminDriverListResult {
    items: AdminDriverItem[];
    page: number;
    page_size: number;
    total: number;
    sort_by: string;
    order: string;
}

export async function getAdminDrivers(
    q?: string,
    banned?: string,
    sortBy: string = "created_at",
    sortOrder: string = "desc",
    page: number = 1,
    pageSize: number = 20,
): Promise<AdminDriverListResult> {
    "use cache";
    cacheLife("minutes");

    const where: Prisma.UserWhereInput = { role: "logistics" };
    if (q) {
        where.OR = [
            { full_name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
        ];
    }
    if (banned === "true") where.banned = true;
    else if (banned === "false") where.banned = false;

    const dir = sortOrder === "asc" ? "asc" : "desc";
    const orderBy: Record<string, unknown> = sortBy === "full_name"
        ? { full_name: dir }
        : { [sortBy]: dir };

    const drivers = await prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
    const total = await prisma.user.count({ where });

    // Obtener conteos de envíos activos en una sola query (evita N+1)
    const driverIds = drivers.map((d) => d.id);
    const activeCounts = await prisma.shipment.groupBy({
        by: ["logistics_id"],
        where: {
            logistics_id: { in: driverIds },
            status: { not: "delivered" },
        },
        _count: { logistics_id: true },
    });

    const countMap: Record<string, number> = {};
    for (const c of activeCounts) {
        if (c.logistics_id) {
            countMap[c.logistics_id] = c._count.logistics_id;
        }
    }

    const items = drivers.map((d) => ({
        user_id: d.id,
        full_name: d.full_name,
        email: d.email,
        banned: d.banned,
        active_shipments: countMap[d.id] ?? 0,
        created_at: d.created_at.toISOString(),
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
