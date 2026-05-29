import prisma from "@/lib/db/prisma";
import { cacheLife } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { generatePrefixedId } from "@/lib/utils/server-utils";
import { ROLES } from "@/lib/types/auth";

export async function getInternalUserId(clerkUserId: string) {
    "use cache";
    cacheLife("hours");

    const existing = await prisma.user.findUnique({
        where: { clerk_user_id: clerkUserId },
        select: { id: true, role: true, banned: true, full_name: true },
    });

    if (existing) return existing;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const role = clerkUser.publicMetadata?.role as string | undefined;
    if (role !== ROLES.LOGISTICS && role !== ROLES.ADMIN_LOGISTICS) return null;

    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
    const full_name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

    return prisma.user.create({
        data: {
            id: generatePrefixedId("usr"),
            clerk_user_id: clerkUserId,
            email,
            full_name,
            role,
        },
        select: { id: true, role: true, banned: true, full_name: true },
    });
}
