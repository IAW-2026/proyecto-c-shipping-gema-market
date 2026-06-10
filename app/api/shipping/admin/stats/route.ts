import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { logIncomingResponse } from "@/lib/utils/api-logger";
import { getShippingAdminStats } from "@/lib/db/queries/admin/stats";
import { AdminStatsQuerySchema } from "@/lib/schemas/api/admin";

export async function GET(request: NextRequest) {
    const start = Date.now();
    const endpoint = "GET /api/shipping/admin/stats";

    if (!validateApiKey(request)) {
        logIncomingResponse(endpoint, 401, { error: "Unauthorized" }, Date.now() - start);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const rawParams = Object.fromEntries(searchParams.entries());
        const parsed = AdminStatsQuerySchema.safeParse(rawParams);

        if (!parsed.success) {
            const response = { error: "Invalid query parameters", details: parsed.error.flatten() };
            logIncomingResponse(endpoint, 400, response, Date.now() - start);
            return NextResponse.json(response, { status: 400 });
        }

        const params = parsed.data;
        const result = await getShippingAdminStats(
            params.date_from,
            params.date_to,
        );

        logIncomingResponse(endpoint, 200, result, Date.now() - start);
        return NextResponse.json(result);
    } catch (error) {
        console.error("[ADMIN_STATS] Error:", error);
        const response = { error: "Error interno del servidor" };
        logIncomingResponse(endpoint, 500, response, Date.now() - start);
        return NextResponse.json(response, { status: 500 });
    }
}
