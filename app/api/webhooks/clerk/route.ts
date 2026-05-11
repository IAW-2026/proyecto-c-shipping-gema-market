import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook para eventos de Clerk (User Created, Updated, etc.).
 * Permite sincronizar la base de datos local con los cambios en Clerk.
 */
export async function POST(request: NextRequest) {
    try {
        // TODO: Validar firma del Webhook (svix)
        const payload = await request.json();
        const eventType = payload.type;

        console.log(`[WEBHOOK] Recibido evento de Clerk: ${eventType}`);

        if (eventType === "user.created") {
            const { id, first_name, last_name, public_metadata } = payload.data;
            console.log(`Sincronizando nuevo usuario ${id}: ${first_name} ${last_name}`);
            // TODO: Guardar en DB local si es necesario
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("[WEBHOOK ERROR]", error);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }
}
