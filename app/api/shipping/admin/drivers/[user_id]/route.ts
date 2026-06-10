import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { logIncomingResponse } from "@/lib/utils/api-logger";
import { toggleBan } from "@/lib/db/mutations/admin/drivers";
import { AdminPatchDriverBodySchema } from "@/lib/schemas/api/admin";

interface RouteParams {
    params: Promise<{ user_id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const start = Date.now();
    const endpoint = "PATCH /api/shipping/admin/drivers/{user_id}";

    if (!validateApiKey(request)) {
        logIncomingResponse(endpoint, 401, { error: "Unauthorized" }, Date.now() - start);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { user_id } = await params;
        const body = await request.json();
        const parsed = AdminPatchDriverBodySchema.safeParse(body);

        if (!parsed.success) {
            const response = { error: "Invalid body", details: parsed.error.flatten() };
            logIncomingResponse(endpoint, 400, response, Date.now() - start);
            return NextResponse.json(response, { status: 400 });
        }

        const { banned } = parsed.data;
        const result = await toggleBan(user_id, banned);

        if (!result) {
            const response = { error: "Usuario no encontrado" };
            logIncomingResponse(endpoint, 404, response, Date.now() - start);
            return NextResponse.json(response, { status: 404 });
        }

        const response = {
            user_id: user_id,
            banned: banned,
        };

        logIncomingResponse(endpoint, 200, response, Date.now() - start);
        return NextResponse.json(response);
    } catch (error) {
        console.error("[ADMIN_DRIVERS_PATCH] Error:", error);
        const response = { error: "Error interno del servidor" };
        logIncomingResponse(endpoint, 500, response, Date.now() - start);
        return NextResponse.json(response, { status: 500 });
    }
}
