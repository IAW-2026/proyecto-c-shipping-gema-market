import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { generatePrefixedId } from "@/lib/utils/server-utils";
import { ROLES } from "@/lib/types/auth";
import { getInternalUserId } from "./get-internal-user-id";

export const getAuthenticatedUserId = cache(async () => {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;

    const user = await getInternalUserId(clerkUserId);
    if (user) return user;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const role = clerkUser.publicMetadata?.role as string | undefined;
    if (role !== ROLES.LOGISTICS && role !== ROLES.ADMIN_LOGISTICS) return null;

    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
    const full_name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

    return prisma.user.upsert({
        where: { clerk_user_id: clerkUserId },
        update: { email, full_name, role },
        create: {
            id: generatePrefixedId("usr"),
            clerk_user_id: clerkUserId,
            email,
            full_name,
            role,
        },
        select: { id: true, role: true, banned: true, full_name: true },
    });
});

export async function requireAuthenticatedUser() {
    const user = await getAuthenticatedUserId();
    if (!user) redirect("/sign-in");
    return user;
}
