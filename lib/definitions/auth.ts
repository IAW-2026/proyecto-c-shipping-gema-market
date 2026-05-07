// lib/definitions/auth.ts (CORREGIDO)
import { UserRole } from "../shared/auth-constants";

// Re-exportar para mantener compatibilidad de imports existentes
export type { UserRole };

export interface UserSessionClaims {
    metadata?: {
        role?: UserRole;
    };
}
