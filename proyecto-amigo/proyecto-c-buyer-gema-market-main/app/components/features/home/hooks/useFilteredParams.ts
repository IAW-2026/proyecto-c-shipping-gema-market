import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { parseFiltersFromParams } from "../utils/filterParser";
import type { ParsedFilters } from "../utils/filterParser";

/**
 * Hook para sincronizar filtros con URL sin duplicar estado
 *
 * En lugar de mantener un estado local que se replica desde la URL,
 * leer directamente desde searchParams mejora:
 * - Elimina renders duplicados
 * - La URL es la única fuente de verdad
 * - Mejor sincronización con cambios de URL
 *
 * @returns Objeto con filtros parseados desde la URL
 */
export function useFilteredParams(): ParsedFilters {
  const searchParams = useSearchParams();

  // useMemo asegura que solo se recalcula cuando searchParams cambia
  const filters = useMemo(() => {
    return parseFiltersFromParams(searchParams);
  }, [searchParams]);

  return filters;
}