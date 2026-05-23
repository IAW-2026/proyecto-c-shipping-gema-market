import { NextRequest, NextResponse } from "next/server";
import { getUsuarioById } from "@/app/lib/db/user";
import { validateApiKey } from "@/app/lib/utils/hmac";

/**
 * GET /api/buyer/:buyer_id
 * Consumido por: Seller App, Shipping App.
 * Devuelve la información pública del comprador almacenada en la BD.
 *
 * @see docs/apis.md
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ buyer_id: string }> },
) {
  if (!validateApiKey(_req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { buyer_id } = await params;

    const usuario = await getUsuarioById(buyer_id);

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: usuario.id,
      email: usuario.email,
      full_name: usuario.fullName,
      phone_number: usuario.phoneNumber,
      address: usuario.address,
      created_at: usuario.createdAt,
    });
  } catch (error) {
    console.error("[GET /api/buyer/:buyer_id] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener datos del usuario" },
      { status: 500 },
    );
  }
}
