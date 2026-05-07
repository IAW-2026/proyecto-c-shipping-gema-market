import { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/shared/auth-constants";


export const metadata: Metadata = {
    title: "Modo repartidor | UniHousing Shipping",
    description: "Interfaz optimizada para el proceso de entrega activo. Herramientas de navegación, escaneo de paquetes y actualización de estados en ruta para el repartidor.",
};
export default async function CourierPage() {
    await requireRole([ROLES.LOGISTICS, ROLES.ADMIN]);

    return (
        <div className="p-4 lgx:p-7">
            {/* 
        El espacio está deliberadamente en blanco. 
        Aquí se montarán los Server Components asíncronos en la Etapa 3.
      */}
        </div>
    );
}