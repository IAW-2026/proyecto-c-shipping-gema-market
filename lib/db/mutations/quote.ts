import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { generatePrefixedId } from "@/lib/shared/server-utils";
import type { CreateQuoteData } from "@/lib/db/queries/quote";

export async function createQuoteRecord(data: CreateQuoteData) {
    return prisma.quote.create({
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
    return prisma.quote.update({
        where: { id: quoteId },
        data: { status: "reserved", reserved_for_order_id: orderId },
    });
}

export async function releaseQuoteInDb(quoteId: string, orderId: string) {
    await prisma.quote.update({
        where: { id: quoteId },
        data: {
            status: "available",
            reserved_for_order_id: null,
            valid_until: new Date(Date.now() + 1 * 60 * 60 * 1000),
        },
    });
}

export async function confirmQuote(quoteId: string, client: Prisma.TransactionClient | typeof prisma = prisma) {
    return client.quote.update({
        where: { id: quoteId },
        data: { status: "confirmed" },
    });
}
