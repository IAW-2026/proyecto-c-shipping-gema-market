// lib/definitions/auth.ts
export type UserRole = 'logistics' | 'admin';

export interface UserSessionClaims {
    metadata?: {
        role?: UserRole;
    };
}