import { UserRole } from "@/lib/definitions/auth";

declare global {
  interface CustomJwtSessionClaims {
    public_metadata?: {
      role?: UserRole;
    };
  }
}