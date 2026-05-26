import { currentUser } from "@clerk/nextjs/server";
import { ROLES, UserRole } from "../definitions/auth";
import { redirect } from "next/navigation";
import { isNextDynamicServerError } from "@/lib/shared/utils";
import prisma from "@/lib/db/prisma";
import getCurrentUserId from "./getCurrentUserId";

export async function requireRole(allowedRoles: UserRole[]) {
    const bypass = process.env.BYPASS_RBAC;
    if (bypass) {
        const bypassUserId = bypass === "true" ? "usr_mock" : bypass;
        await prisma.usuario.upsert({
            where: { id: bypassUserId },
            update: {},
            create: {
                id: bypassUserId,
                clerk_user_id: `clerk_${bypassUserId}`,
                email: `${bypassUserId}@localhost`,
                full_name: "Bypass User",
                role: allowedRoles[0],
            },
        });
        return { userId: bypassUserId, role: allowedRoles[0] };
    }

    try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            redirect("/sign-in");
        }

        const userRole = clerkUser.publicMetadata?.role as UserRole | undefined ?? ROLES.LOGISTICS;

        if (!allowedRoles.includes(userRole)) {
            if (userRole === ROLES.ADMIN_LOGISTICS) {
                redirect("/admin/dashboard");
            }
            if (userRole === ROLES.LOGISTICS) {
                redirect("/dashboard");
            }
            redirect("/unauthorized");
        }

        const userId = await getCurrentUserId();

        if (!userId) {
            redirect("/unauthorized");
        }

        return { userId, role: userRole };
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
