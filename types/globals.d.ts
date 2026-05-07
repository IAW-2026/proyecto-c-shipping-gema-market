// types/globals.d.ts (CORREGIDO)
import { UserRole } from "@/lib/definitions/auth";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRole;
    };
  }
}