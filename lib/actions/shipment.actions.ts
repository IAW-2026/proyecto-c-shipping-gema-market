"use server";

import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { TakeShipmentSchema } from "@/lib/validations/shipment";
import { revalidatePath } from "next/cache";

/**
 * Server Action para que un repartidor tome posesión de un envío disponible.
 */
export async function takeShipmentAction(shipmentId: string) {
    // 1. Verificación de identidad y rol (Defense in Depth)
    const { userId } = await requireRole([ROLES.LOGISTICS, ROLES.SHIPPING_ADMIN]);

    // 2. Validación de datos
    const parsed = TakeShipmentSchema.safeParse({ shipmentId });

    if (!parsed.success) {
        return { 
            success: false, 
            error: "ID de envío inválido" 
        };
    }

    // 3. TODO (Etapa 3): Persistencia en Base de Datos
    // Actualizar el shipment con logisticsId = userId y status = 'pending_pickup'
    console.log(`[ACTION] Usuario ${userId} tomando envío ${shipmentId}`);

    // Simulamos una demora de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // 4. Revalidación de caché de Next.js
    // Esto asegura que al volver al dashboard o lista de disponibles, la UI esté actualizada.
    revalidatePath("/available");
    revalidatePath("/dashboard");

    return { 
        success: true,
        message: "Envío asignado correctamente"
    };
}

/**
 * Server Action para exportar datos (Placeholder para lógica futura)
 */
export async function exportShipmentsAction() {
    const { userId } = await requireRole([ROLES.LOGISTICS, ROLES.SHIPPING_ADMIN]);
    console.log(`[ACTION] Usuario ${userId} solicitando exportación`);
    return { success: true };
}
