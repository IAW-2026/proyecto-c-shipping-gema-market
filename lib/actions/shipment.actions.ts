"use server";

import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { TakeShipmentSchema } from "@/lib/validations/shipment";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { isNextDynamicServerError } from "@/lib/shared/utils";
import { notifyTransition } from "@/lib/services/notification/notification.service";

/**
 * Server Action para que un repartidor tome posesión de un envío disponible.
 */
export async function takeShipmentAction(shipmentId: string) {
    try {
        console.log(`[ACTION] Iniciando takeShipmentAction para: ${shipmentId}`);
        
        const { userId } = await requireRole([ROLES.LOGISTICS]);

        const parsed = TakeShipmentSchema.safeParse({ shipmentId });
        if (!parsed.success) {
            return { success: false, error: "ID de envío inválido" };
        }

        const envio = await prisma.envio.update({
            where: { id: shipmentId, logistics_id: null, status: "waiting_for_courier" },
            data: { logistics_id: userId, status: "pending_pickup" },
            select: { order_id: true, tracking_code: true, status: true },
        });

        await notifyTransition({
            orderId: envio.order_id,
            shippingId: shipmentId,
            trackingCode: envio.tracking_code,
            oldStatus: "waiting_for_courier",
            newStatus: "pending_pickup",
        });

        revalidatePath("/available");
        revalidatePath("/dashboard");
        revalidatePath("/history");

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

/**
 * Server Action para que un repartidor avance en el estado de un envío activo.
 */
export async function transitionShipmentAction(
    shipmentId: string,
    transition: 'pickup' | 'transit' | 'deliver' | 'cancel'
) {
    try {
        const { userId } = await requireRole([ROLES.LOGISTICS]);

        const envio = await prisma.envio.findUnique({
            where: { id: shipmentId },
            select: { id: true, status: true, logistics_id: true, order_id: true, tracking_code: true },
        });

        if (!envio) return { success: false, error: "Envío no encontrado" };

        if (envio.logistics_id !== userId) {
            return { success: false, error: "Este envío no está asignado a ti" };
        }

        if (transition === 'pickup' && envio.status !== 'pending_pickup') {
            return { success: false, error: "El envío debe estar pendiente de retiro para marcarlo como recogido" };
        }

        if (transition === 'transit' && envio.status !== 'picked_up') {
            return { success: false, error: "El envío debe estar retirado para iniciar el viaje" };
        }

        if (transition === 'deliver' && envio.status !== 'in_transit') {
            return { success: false, error: "El envío debe estar en viaje para marcarlo como entregado" };
        }

        const now = new Date();
        const updateData: Record<string, unknown> = {};
        let newStatus: string = envio.status;

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
        }

        await prisma.envio.update({
            where: { id: shipmentId },
            data: updateData,
        });

        await notifyTransition({
            orderId: envio.order_id,
            shippingId: shipmentId,
            trackingCode: envio.tracking_code,
            oldStatus: envio.status as import("@/lib/shared/shipment-constants").ShipmentStatus,
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


