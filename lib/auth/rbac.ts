import { auth } from "@clerk/nextjs/server";
import { UserRole, UserSessionClaims } from "../definitions/auth";
import { redirect } from "next/navigation";
import { isNextDynamicServerError } from "@/lib/shared/utils";
import prisma from "@/lib/db/prisma";

/**
 * Verifica si el usuario actual posee uno de los roles permitidos.
 * Retorna el userId interno (prefijo usr_ ) para usar en consultas a la BD.
 */
export async function requireRole(allowedRoles: UserRole[]) {
    const bypass = process.env.BYPASS_RBAC;
    if (bypass) {
        // BYPASS_RBAC=true usa usr_mock; BYPASS_RBAC=usr_xxx usa ese ID
        const bypassUserId = bypass === "true" ? "usr_mock" : bypass;
        return { userId: bypassUserId, role: allowedRoles[0] };
    }

    try {
        const { userId: clerkUserId, sessionClaims } = await auth();

        if (!clerkUserId) {
            redirect("/login");
        }

        const claims = sessionClaims as UserSessionClaims;
        const userRole = claims?.metadata?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            redirect("/unauthorized");
        }

        const usuario = await prisma.usuario.findUnique({
            where: { clerk_user_id: clerkUserId },
            select: { id: true },
        });

        if (!usuario) {
            redirect("/login");
        }

        return { userId: usuario.id, role: userRole };
    } catch (error) {
        if (isNextDynamicServerError(error)) {
            throw error;
        }
        if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
            throw error;
        }
        console.error("[RBAC] Error in requireRole:", error);
        throw error;
    }
}