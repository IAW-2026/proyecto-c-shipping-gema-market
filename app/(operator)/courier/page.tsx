import { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { getActiveShipments } from "@/lib/db/queries/dashboard.queries";
import { CourierView } from "./_components/courier-view";

export const metadata: Metadata = {
    title: "Modo repartidor | UniHousing Shipping",
    description: "Interfaz optimizada para el proceso de entrega activo.",
};

export default async function CourierPage() {
    const { userId } = await requireRole([ROLES.LOGISTICS, ROLES.SHIPPING_ADMIN]);
    const shipments = await getActiveShipments(userId);

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <CourierView shipments={shipments} />
        </div>
    );
}
