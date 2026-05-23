import type {
  ProductFilters,
  SortByOption,
  OrderOption,
  ProductCondition,
} from "@/app/lib/types/product";
import { PRODUCTS_PAGE_SIZE } from "@/app/lib/constants/pagination";

/**
 * buildFiltersFromParams
 * ──────────────────────
 * Transforma los parámetros crudos de la URL en un objeto ProductFilters tipado.
 * Se llama en page.tsx para derivar los filtros desde Next.js searchParams.
 *
 * ¿Por qué existe esta función?
 * Next.js entrega searchParams con el tipo:
 *   Record<string, string | string[] | undefined>
 *
 * Cada valor puede ser:
 *   - string        → ?sort=price_asc
 *   - undefined     → el param no existe en la URL
 *
 * getProducts() en cambio espera un ProductFilters bien tipado.
 * Esta función es el puente entre los dos mundos.
 */
export function buildFiltersFromParams(
  params: Record<string, string | string[] | undefined>,
): ProductFilters {
  // ── 1. Categorías (?cat=ropa)
  const rawCat = params["cat"];

  const category_id: string | undefined =
    typeof rawCat === "string" ? rawCat : undefined;

  // ── 2. Ordenamiento (?sort_by=price&order=asc) ───────────────────────────
  const rawSortBy = params["sort_by"];
  const rawOrder = params["order"];

  const sort_by = (Array.isArray(rawSortBy) ? rawSortBy[0] : rawSortBy) as
    | SortByOption
    | undefined;
  const order = (Array.isArray(rawOrder) ? rawOrder[0] : rawOrder) as
    | OrderOption
    | undefined;

  // ── 3. Búsqueda por texto (?q=zapatillas) ─────────────────────────────────
  const rawQ = params["q"];
  const q = Array.isArray(rawQ) ? rawQ[0] : rawQ;

  // ── 4. Precio (?min_price=100&max_price=500) ──────────────────────────────
  const rawMin = params["min_price"];
  const rawMax = params["max_price"];
  const min_price = rawMin
    ? Number(Array.isArray(rawMin) ? rawMin[0] : rawMin)
    : undefined;
  const max_price = rawMax
    ? Number(Array.isArray(rawMax) ? rawMax[0] : rawMax)
    : undefined;

  // ── 5. Condición (?condition=nuevo) ───────────────────────────────────────
  const rawCondition = params["condition"];
  const condition = (Array.isArray(rawCondition)
    ? rawCondition[0]
    : rawCondition) as ProductCondition | undefined;

  // ── 6. Paginación (?page=1&page_size=20) ───────────────────────────────────
  const rawPage = params["page"];
  const page = Number(Array.isArray(rawPage) ? rawPage[0] : rawPage) || 1;
  const rawPageSize = params["page_size"];
  const pageSize =
    Number(Array.isArray(rawPageSize) ? rawPageSize[0] : rawPageSize) ||
    PRODUCTS_PAGE_SIZE;

  // ── 7. Construir el objeto final omitiendo claves vacías ──────────────────
  return {
    ...(q ? { q } : {}),
    ...(category_id ? { category_id } : {}),
    ...(min_price !== undefined ? { min_price } : {}),
    ...(max_price !== undefined ? { max_price } : {}),
    ...(condition ? { condition } : {}),
    ...(sort_by ? { sort_by } : {}),
    ...(order ? { order } : {}),
    ...(page ? { page } : {}),
    ...(pageSize ? { page_size: pageSize } : {}),
  };
}
