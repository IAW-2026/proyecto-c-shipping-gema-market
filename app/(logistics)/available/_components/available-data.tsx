import { getAvailableShipments } from "@/lib/db/queries/shipment";
import type { ShipmentFilterParams } from "@/lib/definitions/shipment";
import { AvailableShipmentCard } from "./shipment-card";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import prisma from "@/lib/db/prisma";

interface AvailableDataProps {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    weightMin?: number;
    weightMax?: number;
    priceMin?: number;
    priceMax?: number;
    distanceMin?: number;
    distanceMax?: number;
}

export async function AvailableData({
    sortBy,
    sortOrder,
    weightMin,
    weightMax,
    priceMin,
    priceMax,
    distanceMin,
    distanceMax,
}: AvailableDataProps) {
    const { userId } = await requireRole([ROLES.LOGISTICS]);

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { banned: true },
    });

    if (user?.banned) {
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

    const params: ShipmentFilterParams = {
        sortBy: sortBy as ShipmentFilterParams["sortBy"],
        sortOrder,
        weightMin,
        weightMax,
        priceMin,
        priceMax,
        distanceMin,
        distanceMax,
    };

    const offers = await getAvailableShipments(params);
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
