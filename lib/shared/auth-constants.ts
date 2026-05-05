/**
 * Diccionario centralizado de roles permitidos en la Shipping App.
 * Al usar 'as const', TypeScript infiere que estos valores son inmutables de solo lectura.
 */
export const ROLES = {
    ADMIN: "admin",
    LOGISTICS: "logistics",
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];