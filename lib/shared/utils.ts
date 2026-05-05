import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind de forma segura, resolviendo conflictos.
 * Utiliza 'clsx' para condicionales y 'tailwind-merge' para evitar clases duplicadas.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
