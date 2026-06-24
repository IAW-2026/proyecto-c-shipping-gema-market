import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { cacheLife } from "next/cache";

interface AdminUserItem {
    user_id: string;
    clerk_user_id: string;
    email: string;
    full_name: string;
    role: string;
    banned: boolean;
    created_at: string;
}

interface AdminUserListResult {
    items: AdminUserItem[];
    page: number;
    page_size: number;
    total: number;
}

export async function getAdminUsers(
    sortBy: string = "created_at",
    sortOrder: string = "desc",
    page: number = 1,
    pageSize: number = 20,
): Promise<AdminUserListResult> {
    "use cache";
    cacheLife("minutes");

    const where: Prisma.UserWhereInput = { role: "logistics" };

    const dir = sortOrder === "asc" ? "asc" : "desc";
    const orderBy: Record<string, unknown> = sortBy === "full_name"
        ? { full_name: dir }
        : { [sortBy]: dir };

    const users = await prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
    const total = await prisma.user.count({ where });

    const items = users.map((u) => ({
        user_id: u.id,
        clerk_user_id: u.clerk_user_id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        banned: u.banned,
        created_at: u.created_at.toISOString(),
    }));

    return {
        items,
        page,
        page_size: pageSize,
        total,
    };
}
