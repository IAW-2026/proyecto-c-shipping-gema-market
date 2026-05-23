/**
 * Convierte cadenas de condición a valores intereños
 */
export const CONDITION_OPTIONS = {
  nuevo: "Nuevo",
  usado: "Usado",
} as const;

/**
 * Opciones de ordenamiento para el select
 */
export const SORT_OPTIONS = [
  { value: "", label: "Relevancia" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "newest", label: "Más nuevos" },
] as const;
