/** Orquestador del flujo de cotización: coordina API externa, geocoding, pricing y persistencia. */
import { sellerApiClient } from "@/lib/clients/seller-api/seller-api.client";
import { getCoordinatesFromAddress, getMatrixDistance } from "@/lib/services/map-services";
import type { ApiTrace } from "@/lib/shared/api-trace";
import type { z } from "zod";
import type { quoteRequestSchema } from "@/lib/validations/api-schemas";
import { calculateVolume, calculatePrice, calculateEstimatedDays, getDefaultPricePerKm, CURRENCY, DEFAULT_DISTANCE_KM } from "./price-and-time-calculator";
import { validateQuoteForReservation, validateQuoteForRelease } from "./state-validations";
import { findMatchingTarifa, findQuoteById, findQuoteForRelease, createQuoteRecord, reserveQuoteInDb, releaseQuoteInDb, type CreateQuoteData } from "./database-operations";

type QuoteRequest = z.infer<typeof quoteRequestSchema>;

export interface QuoteResult {
    quote_id: string;
    price: number;
    currency: string;
    estimated_days: number;
    valid_until: string;
}

export async function calculateQuote(
    data: QuoteRequest,
    trace?: ApiTrace,
    req?: Request
): Promise<QuoteResult> {
    const { destination_address, product_id, weight_kg, height_cm, width_cm, depth_cm } = data;

    const originResult = await sellerApiClient.getOriginAddress(product_id, trace, req);
    if (!originResult?.data) {
        throw new Error("No se pudo obtener la dirección de origen del producto");
    }
    const origin = originResult.data.origin_address;

    const toAddressInput = (addr: typeof origin) => ({
        street: addr.street, number: addr.number, zip: addr.zip
    });

    const [originCoords, destCoords] = await Promise.all([
        getCoordinatesFromAddress(toAddressInput(origin)),
        getCoordinatesFromAddress({
            street: destination_address.street,
            number: destination_address.number,
            zip: destination_address.zip,
        }),
    ]);

    const volume_m3 = calculateVolume(height_cm, width_cm, depth_cm);

    let distanceKm = DEFAULT_DISTANCE_KM;
    let durationSeconds: number | undefined;
    if (originCoords && destCoords) {
        try {
            const matrix = await getMatrixDistance(originCoords, destCoords);
            distanceKm = matrix.distance_km || DEFAULT_DISTANCE_KM;
            durationSeconds = matrix.duration_seconds ?? undefined;
        } catch {
            console.warn("[Cotización] Error al obtener distancia, continuando con valor por defecto");
        }
    }

    const [tarifa] = await Promise.all([findMatchingTarifa(weight_kg, volume_m3)]);

    const pricePerKm = tarifa ? tarifa.price_per_km : getDefaultPricePerKm();
    const price = calculatePrice(pricePerKm, distanceKm);
    const estimatedDays = calculateEstimatedDays(durationSeconds);
    const valid_until = new Date(Date.now() + 1 * 60 * 60 * 1000);

    const recordData: CreateQuoteData = {
        product_id,
        package_details: { weight: weight_kg, width: width_cm, height: height_cm, depth: depth_cm, unit: "kg/cm" },
        origin_address: { street: origin.street, number: origin.number, zip: origin.zip },
        destination_address: {
            street: destination_address.street,
            number: destination_address.number,
            zip: destination_address.zip,
            floor: destination_address.floor ?? null,
            apartment: destination_address.apartment ?? null,
        },
        price,
        currency: CURRENCY,
        estimated_days: estimatedDays,
        valid_until,
        pickup_lat: originCoords?.[1] ?? null,
        pickup_lng: originCoords?.[0] ?? null,
        delivery_lat: destCoords?.[1] ?? null,
        delivery_lng: destCoords?.[0] ?? null,
        route_distance: distanceKm * 1000,
        route_duration: durationSeconds ?? null,
    };

    const cotizacion = await createQuoteRecord(recordData);

    return {
        quote_id: cotizacion.id,
        price: Number(cotizacion.price),
        currency: cotizacion.currency,
        estimated_days: cotizacion.estimated_days,
        valid_until: cotizacion.valid_until.toISOString(),
    };
}

export async function reserveQuote(quoteId: string, orderId: string): Promise<{ reserved_until: string }> {
    const cotizacion = await findQuoteById(quoteId);
    validateQuoteForReservation(cotizacion, orderId);
    const updated = await reserveQuoteInDb(quoteId, orderId);
    return { reserved_until: updated.valid_until.toISOString() };
}

export async function releaseQuote(quoteId: string, orderId: string): Promise<void> {
    const cotizacion = await findQuoteForRelease(quoteId, orderId);
    validateQuoteForRelease(cotizacion);
    await releaseQuoteInDb(quoteId, orderId);
}
