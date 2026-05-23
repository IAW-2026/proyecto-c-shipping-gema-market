import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  serializeFiltersToParams,
  areParamsEqual,
} from "../utils/filterSerializer";
import type { FiltersToSerialize } from "../utils/filterSerializer";

/**
 * Hook para manejar la aplicación de filtros con manejo de errores
 */
export function useApplyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const applyFilters = useCallback(
    async (filters: FiltersToSerialize): Promise<boolean> => {
      try {
        const newParams = serializeFiltersToParams(filters, searchParams);

        // No hacer nada si los parámetros son iguales
        if (areParamsEqual(newParams, searchParams)) {
          return false;
        }

        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
        return true;
      } catch (error) {
        console.error("[useApplyFilters] Error applying filters:", error);
        return false;
      }
    },
    [router, pathname, searchParams],
  );

  return applyFilters;
}

/**
 * Hook para limpiar los filtros (mantiene la búsqueda)
 */
export function useClearFilters() {
  const applyFilters = useApplyFilters();
  const searchParams = useSearchParams();

  const clearFilters = useCallback(
    async (currentSearchQuery?: string) => {
      try {
        // Si no se proporciona, obtener de los searchParams actuales
        const searchQuery = currentSearchQuery ?? searchParams.get("q") ?? "";

        await applyFilters({
          searchQuery, // Mantiene la búsqueda actual
          combinedSort: "",
          condition: "",
          maxPrice: 1000000,
        });
      } catch (error) {
        console.error("[useClearFilters] Error clearing filters:", error);
      }
    },
    [applyFilters, searchParams],
  );

  return clearFilters;
}