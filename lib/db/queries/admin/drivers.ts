import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { AdminDriver, AdminDriverDetail, DriverShipment } from "@/lib/definitions/admin-dashboard-metrics";
import type { PaginatedResult } from "@/lib/definitions/shipments/filters";
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

    const [drivers, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: { _count: { select: { shipments: true } } },
            orderBy: { created_at: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.user.count({ where }),
    ]);

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

    const [shipments, total] = await Promise.all([
        prisma.shipment.findMany({
            where,
            orderBy: { created_at: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.shipment.count({ where }),
    ]);

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
