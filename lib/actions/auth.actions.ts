"use server";

import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";
import { generatePrefixedId, isNextDynamicServerError } from "@/lib/shared/utils";

export async function syncNewUserAction(clerkUserId: string) {
    try {
        const client = await clerkClient();
        const user = await client.users.getUser(clerkUserId);

        const email = user.emailAddresses?.[0]?.emailAddress ?? "";
        const full_name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
        const role = "logistics";

        await prisma.usuario.upsert({
            where: { clerk_user_id: clerkUserId },
            update: { email, full_name, role },
            create: {
                id: generatePrefixedId("usr"),
                clerk_user_id: clerkUserId,
                email,
                full_name,
                role,
            },
        });

        await client.users.updateUser(clerkUserId, {
            publicMetadata: { role },
        });

        return { success: true };
    } catch (error) {
        if (isNextDynamicServerError(error)) {
            throw error;
        }
        console.error("[syncNewUserAction]", error);
        return { error: "Error al sincronizar usuario" };
    }
}
