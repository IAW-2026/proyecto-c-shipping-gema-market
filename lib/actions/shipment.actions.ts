"use server";

import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { TakeShipmentSchema } from "@/lib/validations/shipment";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { isNextDynamicServerError } from "@/lib/shared/server-utils";
import { notifyTransition } from "@/lib/services/notification/notification.service";
import { assignShipmentToDriver, transitionShipmentStatus } from "@/lib/db/mutations/logistics/shipments";

export async function takeShipmentAction(shipmentId: string) {
    try {
        const { userId } = await requireRole([ROLES.LOGISTICS]);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { banned: true },
        });
        if (user?.banned) {
            return { success: false, error: "Tu cuenta está suspendida. No puedes tomar nuevos envíos." };
        }

        const parsed = TakeShipmentSchema.safeParse({ shipmentId });
        if (!parsed.success) {
            return { success: false, error: "ID de envío inválido" };
        }

        const shipment = await assignShipmentToDriver(shipmentId, userId);

        await notifyTransition({
            orderId: shipment.order_id,
            shippingId: shipmentId,
            trackingCode: shipment.tracking_code,
            oldStatus: "waiting_for_courier",
            newStatus: "pending_pickup",
        });

        revalidatePath("/available");
        revalidatePath("/dashboard");
        revalidatePath("/history");
        revalidatePath("/courier");
        revalidatePath(`/shipments/${shipmentId}`);

        return {
            success: true,
            message: "Envío asignado correctamente"
        };
    } catch (error) {
        if (isNextDynamicServerError(error)) throw error;
        console.error("[ACTION] Error en takeShipmentAction:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido"
        };
    }
}

export async function transitionShipmentAction(
    shipmentId: string,
    transition: 'pickup' | 'transit' | 'deliver' | 'cancel'
) {
    try {
        const { userId } = await requireRole([ROLES.LOGISTICS]);

        const shipment = await prisma.shipment.findUnique({
            where: { id: shipmentId },
            select: { id: true, status: true, logistics_id: true, order_id: true, tracking_code: true },
        });

        if (!shipment) return { success: false, error: "Envío no encontrado" };

        if (shipment.logistics_id !== userId) {
            return { success: false, error: "Este envío no está asignado a ti" };
        }

        if (transition === 'pickup' && shipment.status !== 'pending_pickup') {
            return { success: false, error: "El envío debe estar pendiente de retiro para marcarlo como recogido" };
        }

        if (transition === 'transit' && shipment.status !== 'picked_up') {
            return { success: false, error: "El envío debe estar retirado para iniciar el viaje" };
        }

        if (transition === 'deliver' && shipment.status !== 'in_transit') {
            return { success: false, error: "El envío debe estar en viaje para marcarlo como entregado" };
        }

        const now = new Date();
        const updateData: Record<string, unknown> = {};
        let newStatus: string = shipment.status;

        if (transition === 'pickup') {
            newStatus = 'picked_up';
            updateData.status = newStatus;
            updateData.picked_up_at = now;
        } else if (transition === 'transit') {
            newStatus = 'in_transit';
            updateData.status = newStatus;
        } else if (transition === 'deliver') {
            newStatus = 'delivered';
            updateData.status = newStatus;
            updateData.delivered_at = now;
        } else if (transition === 'cancel') {
            newStatus = 'waiting_for_courier';
            updateData.status = newStatus;
            updateData.logistics_id = null;
            updateData.picked_up_at = null;
            updateData.delivered_at = null;
            revalidatePath(`/shipments/${shipmentId}`);
        }

        await transitionShipmentStatus(shipmentId, updateData);

        await notifyTransition({
            orderId: shipment.order_id,
            shippingId: shipmentId,
            trackingCode: shipment.tracking_code,
            oldStatus: shipment.status as import("@/lib/shared/shipment-constants").ShipmentStatus,
            newStatus: newStatus as import("@/lib/shared/shipment-constants").ShipmentStatus,
        });

        revalidatePath("/courier");
        revalidatePath("/dashboard");
        revalidatePath("/available");
        revalidatePath("/history");

        return { success: true };
    } catch (error) {
        if (isNextDynamicServerError(error)) throw error;
        console.error("[ACTION] Error en transitionShipmentAction:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido"
        };
    }
}
