import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { ShipmentOffer, PaginatedResult } from "@/lib/definitions/shipments";
import { offerSelect, toShipmentOffer, buildOrderBy } from "@/lib/db/queries/shared";
import type { ShipmentFilterParams } from "@/lib/definitions/shipments";
import { cacheLife } from "next/cache";

export async function getAvailableShipments(params?: ShipmentFilterParams): Promise<PaginatedResult<ShipmentOffer>> {
    "use cache";
    cacheLife("minutes");

    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;

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

    const [shipments, total] = await Promise.all([
        prisma.envio.findMany({
            where,
            orderBy,
            select: offerSelect,
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.envio.count({ where }),
    ]);

    return {
        data: shipments.map(toShipmentOffer),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
