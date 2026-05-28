import prisma from "@/lib/db/prisma";

export interface RateRecord {
    id: string;
    price_per_km: number;
}

export interface CreateQuoteData {
    product_id: string;
    package_details: { weight: number; width: number; height: number; depth: number; unit: string };
    origin_address: { street: string; number: string; zip: string };
    destination_address: { street: string; number: string; zip: string; floor?: string | null; apartment?: string | null };
    price: number;
    currency: string;
    estimated_days: number;
    valid_until: Date;
    pickup_lat: number | null;
    pickup_lng: number | null;
    delivery_lat: number | null;
    delivery_lng: number | null;
    route_distance: number | null;
    route_duration: number | null;
}

export async function findMatchingRate(billableWeightKg: number): Promise<RateRecord | null> {
    const rate = await prisma.tarifa.findFirst({
        where: {
            AND: [
                { weight_range: { path: ["min"], lte: billableWeightKg } },
                { weight_range: { path: ["max"], gte: billableWeightKg } },
            ],
        },
    });
    return rate ? { id: rate.id, price_per_km: Number(rate.price_per_km) } : null;
}

export async function findQuoteById(quoteId: string) {
    return prisma.cotizacion.findUnique({ where: { id: quoteId } });
}

export async function findQuoteForRelease(quoteId: string, orderId: string) {
    return prisma.cotizacion.findFirst({
        where: { id: quoteId, reserved_for_order_id: orderId },
    });
}

export async function findReservedQuote(orderId: string) {
    return prisma.cotizacion.findFirst({
        where: { reserved_for_order_id: orderId, status: "reserved" },
    });
}
