import { auth, currentUser } from "@clerk/nextjs/server";
import { ROLES } from "@/lib/types/auth";
import type { UserRole } from "@/lib/types/auth";
import { redirect } from "next/navigation";
import { isNextDynamicServerError } from "@/lib/utils/server-utils";
import prisma from "@/lib/db/prisma";
import getCurrentUserId from "./get-current-user-id";
import { getUserFromCache, setUserInCache } from "./user-cache";

export async function requireRole(allowedRoles: UserRole[]) {
    const bypass = process.env.BYPASS_RBAC;
    if (bypass) {
        const bypassUserId = bypass === "true" ? "usr_mock" : bypass;
        await prisma.user.upsert({
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
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) redirect("/sign-in");

        const cached = getUserFromCache(clerkUserId);
        if (cached) {
            if (!allowedRoles.includes(cached.role as UserRole)) {
                redirectToRole(cached.role);
            }
            return { userId: cached.userId, role: cached.role as UserRole };
        }

        const clerkUser = await currentUser();
        if (!clerkUser) redirect("/sign-in");

        const userRole = clerkUser.publicMetadata?.role as UserRole | undefined ?? ROLES.LOGISTICS;

        if (!allowedRoles.includes(userRole)) {
            redirectToRole(userRole);
        }

        const userId = await getCurrentUserId(clerkUser);

        if (!userId) {
            redirect("/unauthorized");
        }

        setUserInCache(clerkUserId, { userId, role: userRole, firstName: clerkUser.firstName || "" });

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

function redirectToRole(role: string): never {
    if (role === ROLES.ADMIN_LOGISTICS) redirect("/admin/dashboard");
    if (role === ROLES.LOGISTICS) redirect("/dashboard");
    redirect("/unauthorized");
}
