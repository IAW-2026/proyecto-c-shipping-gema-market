import { UserRole } from "@/app/lib/definitions/auth";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRole;
    };
  }
}
