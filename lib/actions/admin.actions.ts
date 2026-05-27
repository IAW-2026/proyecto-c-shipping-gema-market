"use server";

import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { isNextDynamicServerError } from "@/lib/shared/utils";
import { generatePrefixedId } from "@/lib/shared/utils";
import { invalidateUserCache } from "@/lib/auth/user-cache";

export async function deleteDriverAction(driverId: string) {
    try {
        const { userId } = await requireRole([ROLES.ADMIN_LOGISTICS]);

        if (driverId === userId) {
            return { success: false, error: "No puedes eliminarte a ti mismo" };
        }

        await prisma.$transaction(async (tx) => {
            await tx.envio.updateMany({
                where: {
                    logistics_id: driverId,
                    status: { in: ["pending_pickup", "picked_up", "in_transit"] },
                },
                data: { logistics_id: null, status: "waiting_for_courier", picked_up_at: null, delivered_at: null },
            });

            await tx.usuario.delete({ where: { id: driverId } });
        });

        revalidatePath("/admin/drivers");
        revalidatePath("/admin/dashboard");

        return { success: true };
    } catch (error) {
        if (isNextDynamicServerError(error)) throw error;
        console.error("[ADMIN] Error deleteDriverAction:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
}

export async function updateShipmentPriceAction(shipmentId: string, price: number) {
    try {
        await requireRole([ROLES.ADMIN_LOGISTICS]);

        const envio = await prisma.envio.findUnique({
            where: { id: shipmentId },
            select: { status: true },
        });
        if (!envio) return { success: false, error: "Envío no encontrado" };
        if (envio.status !== "waiting_for_courier") {
            return { success: false, error: "Solo se puede editar el precio de envíos sin repartidor asignado" };
        }

        if (price < 0) return { success: false, error: "El precio no puede ser negativo" };

        await prisma.envio.update({
            where: { id: shipmentId },
            data: { price },
        });

        revalidatePath("/admin/shipments");
        return { success: true };
    } catch (error) {
        if (isNextDynamicServerError(error)) throw error;
        console.error("[ADMIN] Error updateShipmentPriceAction:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
}

export async function unassignDriverAction(shipmentId: string) {
    try {
        await requireRole([ROLES.ADMIN_LOGISTICS]);

        const envio = await prisma.envio.findUnique({
            where: { id: shipmentId },
            select: { status: true },
        });

        if (!envio) return { success: false, error: "Envío no encontrado" };
        if (envio.status !== "pending_pickup") {
            return { success: false, error: "Solo se puede desasignar pedidos pendientes de retiro" };
        }

        await prisma.envio.update({
            where: { id: shipmentId },
            data: { logistics_id: null, status: "waiting_for_courier", picked_up_at: null, delivered_at: null },
        });

        revalidatePath("/admin/shipments");
        revalidatePath("/admin/drivers");
        return { success: true };
    } catch (error) {
        if (isNextDynamicServerError(error)) throw error;
        console.error("[ADMIN] Error unassignDriverAction:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
}

export async function deleteShipmentAction(shipmentId: string) {
    try {
        await requireRole([ROLES.ADMIN_LOGISTICS]);

        await prisma.envio.delete({ where: { id: shipmentId } });

        revalidatePath("/admin/shipments");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        if (isNextDynamicServerError(error)) throw error;
        console.error("[ADMIN] Error deleteShipmentAction:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
}

export async function updateRateAction(rateId: string, pricePerKm: number) {
    try {
        await requireRole([ROLES.ADMIN_LOGISTICS]);

        if (pricePerKm < 0) return { success: false, error: "El precio por km no puede ser negativo" };

        await prisma.tarifa.update({
            where: { id: rateId },
            data: { price_per_km: pricePerKm },
        });

        revalidatePath("/admin/rates");
        return { success: true };
    } catch (error) {
        if (isNextDynamicServerError(error)) throw error;
        console.error("[ADMIN] Error updateRateAction:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
}

export async function createRateAction(weightMin: number, weightMax: number, pricePerKm: number) {
    try {
        await requireRole([ROLES.ADMIN_LOGISTICS]);

        if (weightMin < 0 || weightMax < 0 || weightMin >= weightMax) {
            return { success: false, error: "Rango de peso inválido" };
        }
        if (pricePerKm < 0) return { success: false, error: "El precio por km no puede ser negativo" };

        await prisma.$transaction(
            async (tx) => {
                const overlapping = await tx.tarifa.findFirst({
                    where: {
                        AND: [
                            { weight_range: { path: ["max"], gte: weightMin } },
                            { weight_range: { path: ["min"], lte: weightMax } },
                        ],
                    },
                });
                if (overlapping) {
                    throw new Error("El rango de peso se superpone con una tarifa existente");
                }

                await tx.tarifa.create({
                    data: {
                        id: generatePrefixedId("trf"),
                        weight_range: { min: weightMin, max: weightMax },
                        price_per_km: pricePerKm,
                    },
                });
            },
            { isolationLevel: "Serializable" }
        );

        revalidatePath("/admin/rates");
        return { success: true };
    } catch (error) {
        if (isNextDynamicServerError(error)) throw error;
        console.error("[ADMIN] Error createRateAction:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
}

export async function deleteRateAction(rateId: string) {
    try {
        await requireRole([ROLES.ADMIN_LOGISTICS]);

        await prisma.tarifa.delete({ where: { id: rateId } });

        revalidatePath("/admin/rates");
        return { success: true };
    } catch (error) {
        if (isNextDynamicServerError(error)) throw error;
        console.error("[ADMIN] Error deleteRateAction:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
}

export async function toggleBanAction(driverId: string, banned: boolean) {
    try {
        const { userId } = await requireRole([ROLES.ADMIN_LOGISTICS]);

        if (driverId === userId) {
            return { success: false, error: "No puedes banearte a ti mismo" };
        }

        const updated = await prisma.usuario.update({
            where: { id: driverId },
            data: { banned },
            select: { clerk_user_id: true },
        });

        invalidateUserCache(updated.clerk_user_id);

        revalidatePath("/admin/drivers");
        revalidatePath(`/admin/drivers/${driverId}`);
        return { success: true };
    } catch (error) {
        if (isNextDynamicServerError(error)) throw error;
        console.error("[ADMIN] Error toggleBanAction:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
}
