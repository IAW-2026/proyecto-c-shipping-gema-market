import prisma from "@/lib/db/prisma";
import { ShipmentSummary } from "@/lib/schemas/domain";
import type { PaginatedResult, ShipmentFilterParams } from "@/lib/types/shipments/filters";
import { summarySelect, toShipmentSummary, buildWhere, buildOrderBy } from "@/lib/db/queries/shared";
import { cacheLife } from "next/cache";

export async function getFilteredShipments(params: ShipmentFilterParams): Promise<PaginatedResult<ShipmentSummary>> {
    "use cache";
    cacheLife("minutes");
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const where = buildWhere(params);
    const orderBy = buildOrderBy(params.sortBy, params.sortOrder);

    const data = await prisma.shipment.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: summarySelect,
    });
    const total = await prisma.shipment.count({ where });

    return {
        data: data.map(toShipmentSummary),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
