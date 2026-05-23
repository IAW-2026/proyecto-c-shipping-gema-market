import type { ProductCondition } from "@/app/lib/types/product";
import type { ValidSort } from "./filterParser";

export interface FiltersToSerialize {
  searchQuery: string;
  combinedSort: ValidSort;
  condition: ProductCondition | "";
  maxPrice: number;
}

/**
 * Convierte un objeto de filtros a URLSearchParams
 */
export function serializeFiltersToParams(
  filters: FiltersToSerialize,
  currentParams: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams(currentParams.toString());

  // Serializar sort
  if (filters.combinedSort === "price_asc") {
    params.set("sort_by", "price");
    params.set("order", "asc");
  } else if (filters.combinedSort === "price_desc") {
    params.set("sort_by", "price");
    params.set("order", "desc");
  } else if (filters.combinedSort === "newest") {
    params.set("sort_by", "created_at");
    params.set("order", "desc");
  } else {
    params.delete("sort_by");
    params.delete("order");
  }

  // Serializar condición
  if (filters.condition) {
    params.set("condition", filters.condition);
  } else {
    params.delete("condition");
  }

  // Serializar búsqueda
  if (filters.searchQuery) {
    params.set("q", filters.searchQuery);
  } else {
    params.delete("q");
  }

  // Serializar precio máximo
  if (filters.maxPrice < 1000000) {
    params.set("max_price", String(filters.maxPrice));
  } else {
    params.delete("max_price");
  }

  // Reset a página 1 cuando cambian filtros
  params.set("page", "1");

  return params;
}

/**
 * Verifica si dos conjuntos de parámetros son iguales
 */
export function areParamsEqual(
  a: URLSearchParams,
  b: URLSearchParams,
): boolean {
  return a.toString() === b.toString();
}
