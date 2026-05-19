import { auth, clerkClient } from "@clerk/nextjs/server";
import { ROLES, UserRole } from "../definitions/auth";
import { redirect } from "next/navigation";
import { isNextDynamicServerError } from "@/lib/shared/utils";
import prisma from "@/lib/db/prisma";
import { generatePrefixedId } from "@/lib/shared/utils";

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
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            redirect("/login");
        }

        const client = await clerkClient();

        let userRole: UserRole | undefined;
        let email = "";
        let full_name = "";

        try {
            const clerkUser = await client.users.getUser(clerkUserId);
            userRole = clerkUser.publicMetadata?.role as UserRole | undefined;
            email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
            full_name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
        } catch {
            redirect("/unauthorized");
        }

        if (!userRole) {
            redirect("/unauthorized");
        }

        if (!allowedRoles.includes(userRole)) {
            if (userRole === ROLES.ADMIN_LOGISTICS) {
                redirect("/admin/dashboard");
            }
            if (userRole === ROLES.LOGISTICS) {
                redirect("/dashboard");
            }
            redirect("/unauthorized");
        }

        await prisma.usuario.upsert({
            where: { clerk_user_id: clerkUserId },
            update: { email, full_name, role: userRole },
            create: {
                id: generatePrefixedId("usr"),
                clerk_user_id: clerkUserId,
                email,
                full_name,
                role: userRole,
            },
        });

        const usuario = await prisma.usuario.findUnique({
            where: { clerk_user_id: clerkUserId },
            select: { id: true },
        });

        if (!usuario) {
            redirect("/unauthorized");
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
