import { NextRequest, NextResponse } from "next/server";
import { MOCK_PRODUCTS } from "@/app/mocks/seller/data";

/**
 * GET /api/seller/productos
 * Devuelve el listado paginado de productos con filtros opcionales.
 *
 * Query params admitidos:
 *   q           – búsqueda por texto en title
 *   category_id – filtro por categoría (único)
 *   min_price   – precio mínimo
 *   max_price   – precio máximo
 *   seller_id   – filtro por vendedor
 *   condition   – "nuevo" | "usado" | "all"
 *   sort_by     – "price" | "title" | "created_at"
 *   order       – "asc" | "desc"
 *   page        – número de página (default: 1)
 *   page_size   – tamaño de página (default: 20)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const q = searchParams.get("q") ?? undefined;
  const category_id = searchParams.get("category_id") ?? undefined;
  const min_price = searchParams.get("min_price")
    ? Number(searchParams.get("min_price"))
    : undefined;
  const max_price = searchParams.get("max_price")
    ? Number(searchParams.get("max_price"))
    : undefined;
  const seller_id = searchParams.get("seller_id") ?? undefined;
  const condition = searchParams.get("condition") ?? undefined;
  const sort_by = searchParams.get("sort_by") ?? undefined;
  const order = searchParams.get("order") ?? "desc";
  const page = Number(searchParams.get("page") ?? 1);
  const page_size = Number(searchParams.get("page_size") ?? 20);

  let items = [...MOCK_PRODUCTS];

  // ── Filtros ────────────────────────────────────────────────────────────────
  if (q) {
    const lq = q.toLowerCase();
    items = items.filter((p) => p.title.toLowerCase().includes(lq));
  }
  if (category_id) {
    items = items.filter((p) => p.category_id === category_id);
  }
  if (min_price !== undefined) {
    items = items.filter((p) => p.price >= min_price);
  }
  if (max_price !== undefined) {
    items = items.filter((p) => p.price <= max_price);
  }
  if (seller_id) {
    items = items.filter((p) => p.seller_id === seller_id);
  }
  if (condition && condition !== "all") {
    items = items.filter((p) => p.condition === condition);
  }

  // ── Ordenamiento ───────────────────────────────────────────────────────────
  if (sort_by) {
    const isDesc = order === "desc";
    items = [...items].sort((a, b) => {
      let cmp = 0;
      if (sort_by === "price") cmp = a.price - b.price;
      else if (sort_by === "title") cmp = a.title.localeCompare(b.title);
      else if (sort_by === "created_at")
        cmp =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return isDesc ? -cmp : cmp;
    });
  }

  // ── Paginación ─────────────────────────────────────────────────────────────
  const total = items.length;
  const start = (page - 1) * page_size;
  const paginatedItems = items.slice(start, start + page_size);

  // Devolvemos solo los campos del ProductListItem (sin description, images, etc.)
  const listItems = paginatedItems.map(
    ({
      product_id,
      seller_id,
      title,
      price,
      currency,
      category_id,
      condition,
      thumbnail_url,
      href,
    }) => ({
      product_id,
      seller_id,
      title,
      price,
      currency,
      category_id,
      condition,
      thumbnail_url,
      href,
    }),
  );

  return NextResponse.json({
    items: listItems,
    page,
    page_size,
    total,
    sort_by: sort_by ?? "created_at",
    order,
  });
}
