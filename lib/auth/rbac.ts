// lib/auth/rbac.ts
import { auth } from "@clerk/nextjs/server";
import { UserRole, UserSessionClaims } from "../definitions/auth";
import { redirect } from "next/navigation";

/**
 * Verifica si el usuario actual posee uno de los roles permitidos.
 * Lanza una excepción o redirige si no tiene acceso.
 */
export async function requireRole(allowedRoles: UserRole[]) {
    // 1. Soporte para Bypass en desarrollo (para evitar errores de sesión)
    if (process.env.BYPASS_RBAC === "true") {
        console.log("[RBAC] Bypassing role check");
        return { userId: "mock_user", role: allowedRoles[0] };
    }

    try {
        const { userId, sessionClaims } = await auth();

        if (!userId) {
            console.log("[RBAC] No userId found, redirecting to login");
            redirect("/login");
        }

        const claims = sessionClaims as UserSessionClaims;
        const userRole = claims?.metadata?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            console.log(`[RBAC] User ${userId} has role ${userRole}, but needs ${allowedRoles.join(", ")}`);
            redirect("/unauthorized");
        }

        return { userId, role: userRole };
    } catch (error) {
        if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
            throw error; // Re-lanzar redirecciones de Next.js
        }
        console.error("[RBAC] Error in requireRole:", error);
        throw error;
    }
}