import { getAvailableShipments } from "@/lib/db/queries/shipment";
import type { ShipmentFilterParams } from "@/lib/definitions/shipments";
import { AvailableShipmentCard } from "./shipment-card";
import { getAuthContext } from "@/lib/auth/context";
import { getInternalUserId } from "@/lib/auth/get-internal-user-id";
import { AvailableSearchParamsSchema } from "@/lib/validations/shipment";
import prisma from "@/lib/db/prisma";

interface AvailableDataProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function AvailableData({ searchParams }: AvailableDataProps) {
    const { clerkUserId } = await getAuthContext();
    if (!clerkUserId) return null;
    const user = await getInternalUserId(clerkUserId);
    if (!user) return null;

    const dbUser = await prisma.usuario.findUnique({
        where: { id: user.id },
        select: { banned: true },
    });

    if (dbUser?.banned) {
        return (
            <div className="col-span-full text-center py-12">
                <p className="text-red-600 font-semibold text-lg mb-2">
                    Tu cuenta está suspendida
                </p>
                <p className="text-ink-3">
                    No puedes tomar nuevos envíos hasta que un administrador reactive tu cuenta.
                </p>
            </div>
        );
    }

    const raw = await searchParams;
    const params = AvailableSearchParamsSchema.parse(raw);

    const filterParams: ShipmentFilterParams = {
        sortBy: params.sortBy as ShipmentFilterParams["sortBy"],
        sortOrder: params.sortOrder,
        weightMin: params.weightMin,
        weightMax: params.weightMax,
        priceMin: params.priceMin,
        priceMax: params.priceMax,
        distanceMin: params.distanceMin,
        distanceMax: params.distanceMax,
    };

    const offers = await getAvailableShipments(filterParams);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.length === 0 ? (
                <p className="col-span-full text-center text-ink-3 py-12">
                    No hay envíos disponibles para tomar en este momento.
                </p>
            ) : (
                offers.map((offer) => (
                    <AvailableShipmentCard
                        key={offer.shippingId}
                        offer={offer}
                    />
                ))
            )}
        </div>
    );
}
