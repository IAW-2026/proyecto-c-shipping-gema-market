import { NextRequest, NextResponse } from "next/server";
import { createMockQuote } from "@/app/mocks/shipping/data";

/**
 * POST /api/shipping/cotizaciones
 * Simula la cotización de envío de la Shipping App.
 *
 * @see docs/apis.md — POST /api/shipping/cotizaciones
 *
 * Body esperado:
 * {
 *   destination_address: { street, number, zip },
 *   product_id: string,
 *   weight_kg: number,
 *   height_m: number,
 *   width_m: number,
 *   depth_m: number
 * }
 *
 * Response 200:
 * {
 *   quote_id, price, currency, estimated_days, valid_until
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { product_id, weight_kg, height_m, width_m, depth_m } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: "product_id es requerido" },
        { status: 400 },
      );
    }

    // Usar peso del body; si no viene, default 5 kg
    const weight = typeof weight_kg === "number" ? weight_kg : 5;
    const height = typeof height_m === "number" ? height_m : 0.5;
    const width = typeof width_m === "number" ? width_m : 0.5;
    const depth = typeof depth_m === "number" ? depth_m : 0.5;

    const quote = createMockQuote(product_id, weight, height, width, depth);

    return NextResponse.json(quote, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Error al calcular cotización" },
      { status: 500 },
    );
  }
}
