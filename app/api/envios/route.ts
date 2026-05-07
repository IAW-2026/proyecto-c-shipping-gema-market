import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint de compatibilidad para envíos.
 * Se recomienda migrar a /api/shipping/envios.
 */
export async function GET(request: NextRequest) {
    return NextResponse.json({ 
        message: "Shipping API - Use /api/shipping/envios for POST" 
    });
}
