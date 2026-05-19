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

/**
 * Determina si un error es la señal interna de Next.js (DynamicServerError)
 * que indica que una ruta no puede ser estática porque usa APIs dinámicas
 * como headers(), cookies(), o auth() de Clerk.
 *
 * Esta señal NO debe ser atrapada — debe re-lanzarse para que Next.js
 * convierta automáticamente la ruta a renderizado dinámico.
 */
export function isNextDynamicServerError(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        (error as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE'
    );
}
