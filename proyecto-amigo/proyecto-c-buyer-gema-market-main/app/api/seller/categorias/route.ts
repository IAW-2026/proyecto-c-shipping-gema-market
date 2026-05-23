import { NextResponse } from "next/server";
import { MOCK_CATEGORIES } from "@/app/mocks/seller/data";

/**
 * GET /api/seller/categorias
 * Devuelve el listado de categorías disponibles.
 */
export async function GET() {
  return NextResponse.json(MOCK_CATEGORIES);
}
