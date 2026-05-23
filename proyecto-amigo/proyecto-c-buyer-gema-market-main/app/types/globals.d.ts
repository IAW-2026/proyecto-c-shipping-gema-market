export {};

// Extiende CustomJwtSessionClaims para que TypeScript reconozca metadata.role

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: "admin_buyer";
    };
  }
}
