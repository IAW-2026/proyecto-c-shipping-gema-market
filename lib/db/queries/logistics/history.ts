import prisma from "@/lib/db/prisma";
import { ShipmentSummary, PaginatedResult, ShipmentFilterParams } from "@/lib/definitions/shipments";
import { summarySelect, toShipmentSummary, buildWhere, buildOrderBy } from "@/lib/db/queries/shared";
import { cacheLife } from "next/cache";

export async function getFilteredShipments(params: ShipmentFilterParams): Promise<PaginatedResult<ShipmentSummary>> {
    "use cache";
    cacheLife("minutes");
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const where = buildWhere(params);
    const orderBy = buildOrderBy(params.sortBy, params.sortOrder);

    const [data, total] = await Promise.all([
        prisma.shipment.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: summarySelect,
        }),
        prisma.shipment.count({ where }),
    ]);

    return {
        data: data.map(toShipmentSummary),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
