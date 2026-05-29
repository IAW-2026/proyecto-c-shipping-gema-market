import prisma from "@/lib/db/prisma";

export async function getInternalUserId(clerkUserId: string) {
    return prisma.user.findUnique({
        where: { clerk_user_id: clerkUserId },
        select: { id: true, role: true, banned: true, full_name: true },
    });
}
