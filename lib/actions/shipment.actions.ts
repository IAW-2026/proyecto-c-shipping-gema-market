"use server";

import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { TakeShipmentSchema } from "@/lib/validations/shipment";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { generatePrefixedId } from "@/lib/shared/utils";

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

        // 3. Mock delay
        console.log(`[ACTION] Usuario ${userId} tomando envío ${shipmentId}`);
        await new Promise(resolve => setTimeout(resolve, 800));

        // 4. Revalidación
        revalidatePath("/available");
        revalidatePath("/dashboard");

        return { 
            success: true,
            message: "Envío asignado correctamente"
        };
    } catch (error) {
        console.error("[ACTION] Error en takeShipmentAction:", error);
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
