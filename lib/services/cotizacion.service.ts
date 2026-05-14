import prisma from "@/lib/db/prisma";
import { generatePrefixedId } from "@/lib/shared/utils";
import { sellerApiClient } from "@/lib/clients/seller-api/seller-api.client";
import type { z } from "zod";
import type { quoteRequestSchema } from "@/lib/validations/api-schemas";
import type { ApiTrace } from "@/lib/shared/api-trace";

const DEFAULT_DISTANCE_KM = 10;
const QUOTE_VALIDITY_HOURS = 1;
const ESTIMATED_DAYS = 3;
const CURRENCY = "ARS";

type QuoteRequest = z.infer<typeof quoteRequestSchema>;

export interface QuoteResult {
    quote_id: string;
    price: number;
    currency: string;
    estimated_days: number;
    valid_until: string;
}

function calculateVolume(height_cm: number, width_cm: number, depth_cm: number): number {
    return height_cm * width_cm * depth_cm / 1_000_000;
}

function findMatchingTarifa(weight_kg: number, volume_m3: number) {
    return prisma.tarifa.findFirst({
        where: {
            AND: [
                { weight_range: { path: ["min"], lte: weight_kg } },
                { weight_range: { path: ["max"], gte: weight_kg } },
                { volume_range: { path: ["min"], lte: volume_m3 } },
                { volume_range: { path: ["max"], gte: volume_m3 } },
            ],
        },
    });
}

export async function calculateQuote(request: QuoteRequest, trace?: ApiTrace): Promise<QuoteResult> {
    const { destination_address, product_id, weight_kg, height_cm, width_cm, depth_cm } = request;

    const originResult = await sellerApiClient.getOriginAddress(product_id, trace);
    if (!originResult.data) {
        throw new Error("No se pudo obtener la dirección de origen del producto");
    }
    const origin = originResult.data.origin_address;

    const volume_m3 = calculateVolume(height_cm, width_cm, depth_cm);
    const tarifa = await findMatchingTarifa(weight_kg, volume_m3);
    const pricePerKm = tarifa ? Number(tarifa.price_per_km) : 200;
    const price = pricePerKm * DEFAULT_DISTANCE_KM;

    const valid_until = new Date(Date.now() + QUOTE_VALIDITY_HOURS * 60 * 60 * 1000);

    const cotizacion = await prisma.cotizacion.create({
        data: {
            id: generatePrefixedId("qte"),
            product_id,
            status: "available",
            package_details: {
                weight: weight_kg,
                width: width_cm,
                height: height_cm,
                depth: depth_cm,
                unit: "kg/cm",
            },
            origin_address: {
                street: origin.street,
                number: origin.number,
                zip: origin.zip,
            },
            destination_address: {
                street: destination_address.street,
                zip: destination_address.zip,
                floor: destination_address.floor ?? null,
                apartment: destination_address.apartment ?? null,
            },
            price,
            currency: CURRENCY,
            estimated_days: ESTIMATED_DAYS,
            valid_until,
        },
    });

    return {
        quote_id: cotizacion.id,
        price: Number(cotizacion.price),
        currency: cotizacion.currency,
        estimated_days: cotizacion.estimated_days,
        valid_until: cotizacion.valid_until.toISOString(),
    };
}

export async function reserveQuote(quote_id: string, order_id: string): Promise<{ reserved_until: string }> {
    const cotizacion = await prisma.cotizacion.findUnique({ where: { id: quote_id } });
    if (!cotizacion) {
        throw Object.assign(new Error("Cotización no encontrada"), { statusCode: 404, code: "NOT_FOUND" });
    }

    if (cotizacion.valid_until < new Date()) {
        throw Object.assign(new Error("La cotización ha vencido"), { statusCode: 410, code: "GONE" });
    }

    if (cotizacion.status === "reserved" && cotizacion.reserved_for_order_id !== order_id) {
        throw Object.assign(new Error("La cotización ya está reservada por otra orden"), {
            statusCode: 409,
            code: "CONFLICT",
        });
    }

    if (cotizacion.status === "confirmed") {
        throw Object.assign(new Error("La cotización ya fue confirmada"), { statusCode: 409, code: "CONFLICT" });
    }

    await prisma.cotizacion.update({
        where: { id: quote_id },
        data: { status: "reserved", reserved_for_order_id: order_id },
    });

    return { reserved_until: cotizacion.valid_until.toISOString() };
}

export async function releaseQuote(quote_id: string, order_id: string): Promise<void> {
    const cotizacion = await prisma.cotizacion.findFirst({
        where: { id: quote_id, reserved_for_order_id: order_id },
    });

    if (!cotizacion) {
        throw Object.assign(new Error("No hay reserva activa para esta cotización y orden"), {
            statusCode: 404,
            code: "NOT_FOUND",
        });
    }

    await prisma.cotizacion.update({
        where: { id: quote_id },
        data: {
            status: "available",
            reserved_for_order_id: null,
            valid_until: new Date(Date.now() + QUOTE_VALIDITY_HOURS * 60 * 60 * 1000),
        },
    });
}
