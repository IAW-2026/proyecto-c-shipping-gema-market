export const ROLES = {
    LOGISTICS: "logistics",
    ADMIN_LOGISTICS: "admin_logistics",
} as const;
export type UserRole = typeof ROLES[keyof typeof ROLES];

