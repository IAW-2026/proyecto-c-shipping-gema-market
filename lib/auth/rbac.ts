// lib/auth/rbac.ts
import { auth } from "@clerk/nextjs/server";
import { UserRole, UserSessionClaims } from "../definitions/auth";
import { redirect } from "next/navigation";

/**
 * Verifica si el usuario actual posee uno de los roles permitidos.
 * Lanza una excepción o redirige si no tiene acceso.
 */
export async function requireRole(allowedRoles: UserRole[]) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        // Si la llamada ocurre durante el renderizado de una página, redirige.
        // Si ocurre dentro de un Server Action, lanzará un error capturable.
        redirect("/login");
    }

    // Usamos una variable de entorno para hacer bypass 
    const claims = sessionClaims as UserSessionClaims;
    const userRole = claims?.metadata?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
        redirect("/unauthorized"); // Ruta de acceso denegado
    }

    return { userId, role: userRole };
}