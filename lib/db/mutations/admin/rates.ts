import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { generatePrefixedId } from "@/lib/shared/server-utils";

export async function createRate(
    weightMin: number,
    weightMax: number,
    pricePerKm: number,
    tx?: Prisma.TransactionClient
) {
    const client = tx ?? prisma;
    return client.rate.create({
        data: {
            id: generatePrefixedId("trf"),
            weight_range: { min: weightMin, max: weightMax },
            price_per_km: pricePerKm,
        },
    });
}

export async function updateRate(rateId: string, pricePerKm: number) {
    return prisma.rate.update({
        where: { id: rateId },
        data: { price_per_km: pricePerKm },
    });
}

export async function deleteRate(rateId: string) {
    return prisma.rate.delete({ where: { id: rateId } });
}
