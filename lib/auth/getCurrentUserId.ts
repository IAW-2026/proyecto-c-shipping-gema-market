import { cache } from "react";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";
import { generatePrefixedId } from "@/lib/shared/utils";

const getCurrentUserId = cache(async (clerkUser?: User | null): Promise<string | null> => {
    if (!clerkUser) {
        clerkUser = await currentUser();
    }
    if (!clerkUser) return null;

    const clerkUserId = clerkUser.id;
    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
    const full_name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
    const clerkRole = (clerkUser.publicMetadata?.role as string) ?? "logistics";

    const existing = await prisma.usuario.findUnique({
        where: { clerk_user_id: clerkUserId },
        select: { id: true, role: true },
    });

    if (existing) {
        if (existing.role !== clerkRole) {
            await prisma.usuario.update({
                where: { id: existing.id },
                data: { role: clerkRole, email, full_name },
            });
        }
        return existing.id;
    }

    try {
        const created = await prisma.usuario.create({
            data: {
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

        return created.id;
    } catch (error: any) {
        if (error?.code === "P2002") {
            const refetched = await prisma.usuario.findUnique({
                where: { clerk_user_id: clerkUserId },
                select: { id: true },
            });
            return refetched?.id ?? null;
        }
        throw error;
    }
});

export default getCurrentUserId;
