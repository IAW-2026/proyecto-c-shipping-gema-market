/** Servicio de creación de envíos: valida datos del comprador, busca cotización reservada y persiste el envío. */
import { generatePrefixedId } from "@/lib/shared/server-utils";
import { buyerApiClient } from "@/lib/clients/buyer-api/buyer-api.client";
import type { z } from "zod";
import type { createShipmentSchema } from "@/lib/validations/api-schemas";
import { createShipmentRecord, type CreateShipmentData } from "@/lib/db/mutations/shared";
import { findReservedQuote } from "@/lib/db/queries/quote";
import { confirmQuote } from "@/lib/db/mutations/quote";
import prisma from "@/lib/db/prisma";
type CreateShipmentRequest = z.infer<typeof createShipmentSchema>;

function generateTrackingCode(): string {
    const year = new Date().getFullYear();
    const number = Math.floor(1000 + Math.random() * 9000);
    return `BB-${number}-${year}`;
}

export interface CreateShipmentResult {
    shipping_id: string;
    status: string;
    tracking_code: string;
}

export async function createShipment(
    data: CreateShipmentRequest,
    req?: Request
): Promise<CreateShipmentResult> {
    let { order_id, seller_id, buyer_id, receiver_name, receiver_phone } = data;

    if (!receiver_name || !receiver_phone) {
        try {
            const buyerResult = await buyerApiClient.getBuyerData(buyer_id, req);
            if (buyerResult.data) {
                receiver_name ??= buyerResult.data.full_name;
                receiver_phone ??= buyerResult.data.phone_number;
            }
        } catch (e) {
            console.warn("[Envio] Error al obtener datos del buyer:", e instanceof Error ? e.message : e);
        }
        if (!receiver_name || !receiver_phone) {
            throw Object.assign(
                new Error("Datos del comprador incompletos: se require receiver_name y receiver_phone, o X-Mock-Buyer-* en los headers"),
                { statusCode: 400, code: "BAD_REQUEST" }
            );
        }
    }

    const cotizacion = await findReservedQuote(order_id);

    if (!cotizacion) {
        throw Object.assign(
            new Error("No hay una cotización reservada para esta orden. Verifique que la cotización exista y esté reservada."),
            { statusCode: 400, code: "BAD_REQUEST" }
        );
    }

    const tracking_code = generateTrackingCode();
    const packageDetails = cotizacion.package_details as {
        weight: number;
        width: number;
        height: number;
        depth: number;
    };

    const [envio] = await prisma.$transaction(async (tx) => {
        const e = await createShipmentRecord({
            id: generatePrefixedId("shp"),
            order_id,
            quote_id: cotizacion.id,
            buyer_id,
            receiver_name: receiver_name ?? "Comprador",
            receiver_phone: receiver_phone ?? "Sin teléfono",
            seller_id,
            weight: packageDetails.weight ?? 0,
            dimensions: {
                width: packageDetails.width ?? 0,
                height: packageDetails.height ?? 0,
                depth: packageDetails.depth ?? 0,
            },
            pickup_address: cotizacion.origin_address as any,
            delivery_address: cotizacion.destination_address as any,
            tracking_code,
            price: cotizacion.price,
            pickup_lat: (cotizacion.pickup_lat as number | undefined) ?? null,
            pickup_lng: (cotizacion.pickup_lng as number | undefined) ?? null,
            delivery_lat: (cotizacion.delivery_lat as number | undefined) ?? null,
            delivery_lng: (cotizacion.delivery_lng as number | undefined) ?? null,
            route_distance: (cotizacion.route_distance as number | undefined) ?? null,
            route_duration: (cotizacion.route_duration as number | undefined) ?? null,
        }, tx);

        await confirmQuote(cotizacion.id, tx);

        return [e];
    });

    return {
        shipping_id: envio.id,
        status: envio.status,
        tracking_code: envio.tracking_code,
    };
}
