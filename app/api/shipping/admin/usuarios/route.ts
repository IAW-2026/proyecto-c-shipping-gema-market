import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { logIncomingResponse } from "@/lib/utils/api-logger";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
    const start = Date.now();
    const endpoint = "GET /api/shipping/admin/usuarios";

    if (!validateApiKey(request)) {
        logIncomingResponse(endpoint, 401, { error: "Unauthorized" }, Date.now() - start);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, Number(searchParams.get("page") ?? 1));
        const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("page_size") ?? 20)));

        const where = { role: "logistics" };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { created_at: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.user.count({ where }),
        ]);

        const result = {
            items: users.map((u) => ({
                user_id: u.id,
                clerk_user_id: u.clerk_user_id,
                email: u.email,
                full_name: u.full_name,
                role: u.role,
                banned: u.banned,
                created_at: u.created_at.toISOString(),
            })),
            page,
            page_size: pageSize,
            total,
        };

        logIncomingResponse(endpoint, 200, result, Date.now() - start);
        return NextResponse.json(result);
    } catch (error) {
        console.error("[ADMIN_USUARIOS] Error:", error);
        const response = { error: "Error interno del servidor" };
        logIncomingResponse(endpoint, 500, response, Date.now() - start);
        return NextResponse.json(response, { status: 500 });
    }
}
