import prisma from "@/lib/db/prisma";
import type { AdminRate } from "@/lib/definitions/admin-dashboard-metrics";
import type { PaginatedResult } from "@/lib/definitions/shipments/filters";
import { cacheLife } from "next/cache";

export async function getAllRates(
    page: number = 1,
    pageSize: number = 20,
): Promise<PaginatedResult<AdminRate>> {
    "use cache";
    cacheLife("minutes");

    const [rates, total] = await Promise.all([
        prisma.tarifa.findMany({
            orderBy: { id: "asc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.tarifa.count(),
    ]);

    return {
        data: rates.map((r) => {
            const wr = r.weight_range as { min: number; max: number };
            return {
                id: r.id,
                weight_min: wr.min,
                weight_max: wr.max,
                price_per_km: Number(r.price_per_km),
            };
        }),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
