import { cache } from "react";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";
import { generatePrefixedId } from "@/lib/utils/server-utils";

const getCurrentUserId = cache(async (clerkUser?: User | null): Promise<string | null> => {
    if (!clerkUser) {
        clerkUser = await currentUser();
    }
    if (!clerkUser) return null;

    const clerkUserId = clerkUser.id;
    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
    const full_name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
    const clerkRole = (clerkUser.publicMetadata?.role as string) ?? "logistics";

    const user = await prisma.user.upsert({
        where: { clerk_user_id: clerkUserId },
        update: { email, full_name, role: clerkRole },
        create: {
            id: generatePrefixedId("usr"),
            clerk_user_id: clerkUserId,
            email,
            full_name,
            role: clerkRole,
        },
        select: { id: true },
    });

    if (!clerkUser.publicMetadata?.role) {
        const client = await clerkClient();
        await client.users.updateUser(clerkUserId, {
            publicMetadata: { role: clerkRole },
        });
    }

    return user.id;
});

export default getCurrentUserId;
