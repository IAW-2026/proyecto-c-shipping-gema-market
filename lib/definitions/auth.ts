export const ROLES = {
    SHIPPING_ADMIN: "shipping_admin",
    LOGISTICS: "logistics",
} as const;
export type UserRole = typeof ROLES[keyof typeof ROLES];
export interface UserSessionClaims {
    metadata?: {
        role?: UserRole;
    };
}
