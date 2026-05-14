"use server";

import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { TakeShipmentSchema } from "@/lib/validations/shipment";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { generatePrefixedId, isNextDynamicServerError } from "@/lib/shared/utils";

/**
 * Server Action para que un repartidor tome posesión de un envío disponible.
 */
export async function takeShipmentAction(shipmentId: string) {
    try {
        console.log(`[ACTION] Iniciando takeShipmentAction para: ${shipmentId}`);
        
        // 1. Verificación de identidad y rol
        const { userId } = await requireRole([ROLES.LOGISTICS, ROLES.SHIPPING_ADMIN]);

        // 2. Validación de datos
        const parsed = TakeShipmentSchema.safeParse({ shipmentId });
        if (!parsed.success) {
            return { success: false, error: "ID de envío inválido" };
        }

        // 3. Asignar el envío al repartidor en BD
        console.log(`[ACTION] Usuario ${userId} tomando envío ${shipmentId}`);
        await prisma.envio.update({
            where: { id: shipmentId },
            data: { logistics_id: userId },
        });

        // 4. Revalidación
        revalidatePath("/available");
        revalidatePath("/dashboard");
        revalidatePath("/history");

        return { 
            success: true,
            message: "Envío asignado correctamente"
        };
    } catch (error) {
        if (isNextDynamicServerError(error)) {
            throw error;
        }
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
    transition: 'pickup' | 'deliver' | 'cancel'
) {
    try {
        const { userId } = await requireRole([ROLES.LOGISTICS, ROLES.SHIPPING_ADMIN]);

        const envio = await prisma.envio.findUnique({
            where: { id: shipmentId },
            select: { id: true, status: true, logistics_id: true },
        });

        if (!envio) {
            return { success: false, error: "Envío no encontrado" };
        }

        if (envio.logistics_id !== userId) {
            return { success: false, error: "Este envío no está asignado a ti" };
        }

        if (transition === 'pickup' && envio.status !== 'pending_pickup') {
            return { success: false, error: "El envío debe estar pendiente de retiro para marcarlo como recogido" };
        }

        if (transition === 'deliver' && envio.status !== 'in_transit') {
            return { success: false, error: "El envío debe estar en camino para marcarlo como entregado" };
        }

        const now = new Date();

        const updateData: Record<string, unknown> = {};

        if (transition === 'pickup') {
            updateData.status = 'in_transit';
            updateData.picked_up_at = now;
        } else if (transition === 'deliver') {
            updateData.status = 'delivered';
            updateData.delivered_at = now;
        } else if (transition === 'cancel') {
            updateData.status = 'pending_pickup';
            updateData.logistics_id = null;
            updateData.picked_up_at = null;
            updateData.delivered_at = null;
        }

        await prisma.envio.update({
            where: { id: shipmentId },
            data: updateData,
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

/**
 * Server Action para exportar datos (Placeholder para lógica futura)
 */
export async function exportShipmentsAction() {
    const { userId } = await requireRole([ROLES.LOGISTICS, ROLES.SHIPPING_ADMIN]);
    console.log(`[ACTION] Usuario ${userId} solicitando exportación`);
    return { success: true };
}

/**
 * Crea un nuevo envío con ID prefijado y código de seguimiento.
 */
export async function createShipping(data: any) {
  const newShipment = await prisma.envio.create({
    data: {
      id: generatePrefixedId("shp"),
      ...data,
      tracking_code: `BB-${Math.floor(Math.random() * 10000)}-2026`,
    }
  });
  
  revalidatePath("/dashboard");
  revalidatePath("/available");
  
  return newShipment;
}
