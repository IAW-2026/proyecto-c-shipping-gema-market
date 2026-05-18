import prisma from "@/lib/db/prisma";
import { generatePrefixedId } from "@/lib/shared/utils";

export interface TarifaRecord {
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

export async function findMatchingTarifa(weight_kg: number, volume_m3: number): Promise<TarifaRecord | null> {
    const tarifa = await prisma.tarifa.findFirst({
        where: {
            AND: [
                { weight_range: { path: ["min"], lte: weight_kg } },
                { weight_range: { path: ["max"], gte: weight_kg } },
                { volume_range: { path: ["min"], lte: volume_m3 } },
                { volume_range: { path: ["max"], gte: volume_m3 } },
            ],
        },
    });
    return tarifa ? { id: tarifa.id, price_per_km: Number(tarifa.price_per_km) } : null;
}

export async function findQuoteById(quoteId: string) {
    return prisma.cotizacion.findUnique({ where: { id: quoteId } });
}

export async function findQuoteForRelease(quoteId: string, orderId: string) {
    return prisma.cotizacion.findFirst({
        where: { id: quoteId, reserved_for_order_id: orderId },
    });
}

export async function createQuoteRecord(data: CreateQuoteData) {
    return prisma.cotizacion.create({
        data: {
            id: generatePrefixedId("qte"),
            product_id: data.product_id,
            status: "available",
            package_details: data.package_details,
            origin_address: data.origin_address,
            destination_address: data.destination_address,
            price: data.price,
            currency: data.currency,
            estimated_days: data.estimated_days,
            valid_until: data.valid_until,
            pickup_lat: data.pickup_lat,
            pickup_lng: data.pickup_lng,
            delivery_lat: data.delivery_lat,
            delivery_lng: data.delivery_lng,
            route_distance: data.route_distance,
            route_duration: data.route_duration,
        },
    });
}

export async function reserveQuoteInDb(quoteId: string, orderId: string) {
    return prisma.cotizacion.update({
        where: { id: quoteId },
        data: { status: "reserved", reserved_for_order_id: orderId },
    });
}

export async function releaseQuoteInDb(quoteId: string, orderId: string) {
    await prisma.cotizacion.update({
        where: { id: quoteId },
        data: {
            status: "available",
            reserved_for_order_id: null,
            valid_until: new Date(Date.now() + 1 * 60 * 60 * 1000),
        },
    });
}

export async function findReservedCotizacion(orderId: string) {
    return prisma.cotizacion.findFirst({
        where: { reserved_for_order_id: orderId, status: "reserved" },
    });
}

export async function confirmCotizacion(quoteId: string) {
    return prisma.cotizacion.update({
        where: { id: quoteId },
        data: { status: "confirmed" },
    });
}
