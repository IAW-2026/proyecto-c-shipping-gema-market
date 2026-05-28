import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { AdminShipment } from "@/lib/definitions/admin-dashboard-metrics";
import type { PaginatedResult } from "@/lib/definitions/shipments/filters";
import { cacheLife } from "next/cache";

export async function getAllShipments(
    status?: string,
    sortBy?: string,
    sortOrder?: string,
    page: number = 1,
    pageSize: number = 20,
): Promise<PaginatedResult<AdminShipment>> {
    "use cache";
    cacheLife("minutes");

    const where: Prisma.ShipmentWhereInput = {};
    if (status && status !== "all") {
        where.status = status;
    }

    const dir = sortOrder === "asc" ? "asc" : "desc";

    const field = sortBy || "created_at";
    const orderBy: Record<string, unknown> = sortBy === "logistics_id"
        ? { operator: { full_name: dir } }
        : { [field]: dir };

    const [shipments, total] = await Promise.all([
        prisma.shipment.findMany({
            where,
            orderBy,
            include: { operator: { select: { full_name: true } } },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.shipment.count({ where }),
    ]);

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
