import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind de forma segura, resolviendo conflictos.
 * Utiliza 'clsx' para condicionales y 'tailwind-merge' para evitar clases duplicadas.
 */
import { ulid } from "ulid";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Genera un ID con formato 'prefijo_ulid'.
 * Útil para cumplir con el esquema de IDs de la aplicación.
 */
export function generatePrefixedId(prefix: string) {
    return `${prefix}_${ulid()}`;
}
