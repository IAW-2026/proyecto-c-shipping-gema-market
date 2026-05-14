import prisma from "@/lib/db/prisma";
import { generatePrefixedId } from "@/lib/shared/utils";
import type { z } from "zod";
import type { createShipmentSchema } from "@/lib/validations/api-schemas";
import type { Prisma } from "@/lib/generated/prisma/client";
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

export async function createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResult> {
    const { order_id, seller_id, buyer_id, receiver_name, receiver_phone } = request;

    const cotizacion = await prisma.cotizacion.findFirst({
        where: { reserved_for_order_id: order_id, status: "reserved" },
    });

    if (!cotizacion) {
        throw Object.assign(
            new Error("No hay una cotización reservada para esta orden. Verifique que la cotización exista y esté reservada."),
            { statusCode: 400, code: "BAD_REQUEST" }
        );
    }

    const tracking_code = generateTrackingCode();
    const packageDetails = cotizacion.package_details as Prisma.InputJsonValue as {
        weight: number;
        width: number;
        height: number;
        depth: number;
    };

    const envio = await prisma.envio.create({
        data: {
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
            pickup_address: cotizacion.origin_address as Prisma.InputJsonValue,
            delivery_address: cotizacion.destination_address as Prisma.InputJsonValue,
            tracking_code,
            status: "pending_pickup",
            price: cotizacion.price,
        },
    });

    await prisma.cotizacion.update({
        where: { id: cotizacion.id },
        data: { status: "confirmed" },
    });

    return {
        shipping_id: envio.id,
        status: envio.status,
        tracking_code: envio.tracking_code,
    };
}
