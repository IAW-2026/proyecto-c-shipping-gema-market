import type { ProductCondition } from "@/app/lib/types/product";

export type ValidSort = "price_asc" | "price_desc" | "newest" | "";

export interface ParsedFilters {
  searchQuery: string;
  combinedSort: ValidSort;
  condition: ProductCondition | "";
  maxPrice: number;
}

// Validadores inline
function isValidProductCondition(value: unknown): value is ProductCondition {
  const validConditions = ["nuevo", "usado"] as const;
  return validConditions.includes(value as ProductCondition);
}

function parseNumberSafely(
  value: string | null | undefined,
  defaultValue: number,
): number {
  if (!value) return defaultValue;
  const parsed = Number(value);
  return !isNaN(parsed) && parsed > 0 ? parsed : defaultValue;
}

function validateMaxPrice(value: number): number {
  const MIN_PRICE = 0;
  const MAX_PRICE = 1000000;
  if (value < MIN_PRICE) return MIN_PRICE;
  if (value > MAX_PRICE) return MAX_PRICE;
  return value;
}

function validateSearchQuery(value: string | null | undefined): string {
  const query = (value || "").trim();
  return query.substring(0, 200);
}

/**
 * Parsea URLSearchParams a un objeto de filtros tipado y validado
 */
export function parseFiltersFromParams(params: URLSearchParams): ParsedFilters {
  const searchQuery = validateSearchQuery(params.get("q"));

  const sortBy = params.get("sort_by");
  const order = params.get("order");
  const combinedSort = buildCombinedSort(sortBy, order);

  let condition: ProductCondition | "" = "";
  const conditionParam = params.get("condition");
  if (conditionParam && isValidProductCondition(conditionParam)) {
    condition = conditionParam;
  }

  const maxPrice = validateMaxPrice(
    parseNumberSafely(params.get("max_price"), 1000000),
  );

  return {
    searchQuery,
    combinedSort,
    condition,
    maxPrice,
  };
}

/**
 * Convierte sort_by y order en un formato combinado
 */
export function buildCombinedSort(
  sortBy: string | null,
  order: string | null,
): ValidSort {
  if (sortBy === "price" && order === "asc") return "price_asc";
  if (sortBy === "price" && order === "desc") return "price_desc";
  if (sortBy === "created_at" && order === "desc") return "newest";
  return "";
}
