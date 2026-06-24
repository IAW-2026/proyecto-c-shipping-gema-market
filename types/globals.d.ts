import { UserRole } from "@/lib/types/auth";

declare global {
  interface CustomJwtSessionClaims {
    public_metadata?: {
      role?: UserRole;
    };
  }
}