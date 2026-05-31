"use server";

import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/types/auth";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { isNextDynamicServerError } from "@/lib/utils/server-utils";
import { invalidateUserCache } from "@/lib/auth/user-cache";
import { deleteDriver, toggleBan } from "@/lib/db/mutations/admin/drivers";
import { updateShipmentPrice, unassignDriver, deleteShipment } from "@/lib/db/mutations/admin/shipments";
import { createRate, updateRate, deleteRate } from "@/lib/db/mutations/admin/rates";

const PROTECTED_OPERATOR_ID = "usr_01KSTWBKD7VFMD9JQ5FNXMPM5J";

export async function deleteDriverAction(driverId: string) {
    try {
        const { userId } = await requireRole([ROLES.ADMIN_LOGISTICS]);

        if (driverId === userId) {
            return { success: false, error: "No puedes eliminarte a ti mismo" };
        }

        if (driverId === PROTECTED_OPERATOR_ID) {
            return { success: false, error: "No se puede eliminar al operador de testeo" };
        }

        await deleteDriver(driverId);

        revalidatePath("/admin/drivers");
        revalidatePath("/admin/dashboard");
        revalidatePath("/dashboard");
        revalidatePath("/available");
        revalidatePath("/courier");
        revalidatePath("/history");

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

        const shipment = await prisma.shipment.findUnique({
            where: { id: shipmentId },
            select: { status: true },
        });
        if (!shipment) return { success: false, error: "Envío no encontrado" };
        if (shipment.status !== "waiting_for_courier") {
            return { success: false, error: "Solo se puede editar el precio de envíos sin repartidor asignado" };
        }

        if (price < 0) return { success: false, error: "El precio no puede ser negativo" };

        await updateShipmentPrice(shipmentId, price);

        revalidatePath("/admin/shipments");
        revalidatePath("/dashboard");
        revalidatePath("/available");
        revalidatePath("/courier");
        revalidatePath("/history");
        revalidatePath(`/shipments/${shipmentId}`);
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

        const shipment = await prisma.shipment.findUnique({
            where: { id: shipmentId },
            select: { status: true },
        });

        if (!shipment) return { success: false, error: "Envío no encontrado" };
        if (shipment.status !== "pending_pickup") {
            return { success: false, error: "Solo se puede desasignar pedidos pendientes de retiro" };
        }

        await unassignDriver(shipmentId);

        revalidatePath("/admin/shipments");
        revalidatePath("/admin/drivers");
        revalidatePath("/dashboard");
        revalidatePath("/available");
        revalidatePath("/courier");
        revalidatePath("/history");
        revalidatePath(`/shipments/${shipmentId}`);
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

        await deleteShipment(shipmentId);

        revalidatePath("/admin/shipments");
        revalidatePath("/admin/dashboard");
        revalidatePath("/dashboard");
        revalidatePath("/available");
        revalidatePath("/courier");
        revalidatePath("/history");
        revalidatePath(`/shipments/${shipmentId}`);
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

        await updateRate(rateId, pricePerKm);

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
                const overlapping = await tx.rate.findFirst({
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

                await createRate(weightMin, weightMax, pricePerKm, tx);
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

        await deleteRate(rateId);

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

        const updated = await toggleBan(driverId, banned);

        invalidateUserCache(updated.clerk_user_id);

        revalidatePath("/admin/drivers");
        revalidatePath(`/admin/drivers/${driverId}`);
        revalidatePath("/dashboard");
        revalidatePath("/available");
        revalidatePath("/courier");
        revalidatePath("/history");
        return { success: true };
    } catch (error) {
        if (isNextDynamicServerError(error)) throw error;
        console.error("[ADMIN] Error toggleBanAction:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
}
