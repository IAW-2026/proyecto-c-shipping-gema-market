import { NextRequest, NextResponse } from "next/server";
import { MOCK_PRODUCTS } from "@/app/mocks/seller/data";

/**
 * POST /api/seller/productos/batch
 * Devuelve la información de detalle de un lote de productos a partir de sus IDs.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_ids } = body;

    if (
      !product_ids ||
      !Array.isArray(product_ids) ||
      product_ids.length === 0
    ) {
      return NextResponse.json(
        { error: "product_ids is required and must be a non-empty array" },
        { status: 400 },
      );
    }

    const products = MOCK_PRODUCTS.filter((p) =>
      product_ids.includes(p.product_id),
    ).map((p) => ({
      product_id: p.product_id,
      seller_id: p.seller_id,
      title: p.title,
      price: p.price,
      currency: p.currency,
      category_id: p.category_id,
      stock: p.stock,
      condition: p.condition as "nuevo" | "usado",
      thumbnail_url: p.thumbnail_url,
      href: p.href,
      weight: p.weight,
      height: p.height,
      width: p.width,
      depth: p.depth,
    }));

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
