import prisma from "@/lib/db/prisma";
import { cacheLife } from "next/cache";

export async function getInternalUserId(clerkUserId: string) {
    "use cache";
    cacheLife("hours");
    
    return prisma.usuario.findUnique({
        where: { clerk_user_id: clerkUserId },
        select: { id: true, role: true, banned: true, full_name: true },
    });
}
