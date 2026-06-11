import prisma from "@/lib/db/prisma";
import type { AdminRate } from "@/lib/types/admin-dashboard-metrics";
import type { PaginatedResult } from "@/lib/types/shipments/filters";
import { cacheLife } from "next/cache";

export async function getAllRates(
    page: number = 1,
    pageSize: number = 20,
): Promise<PaginatedResult<AdminRate>> {
    "use cache";
    cacheLife("minutes");

    const rates = await prisma.rate.findMany({
        orderBy: { id: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
    const total = await prisma.rate.count();

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
