// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// =========================
// RUTAS PÚBLICAS
// =========================
// Agregá acá todas las rutas que NO requieren login.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/seller(.*)",
  "/api/shipping(.*)",
  "/api/payments(.*)",
  "/api/buyer(.*)",
  "/product(.*)",
]);

// Rutas que además de autenticación requieren rol "admin_buyer"
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Si la ruta NO es pública, requiere autenticación
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Rutas /admin solo accesibles con rol admin_buyer en publicMetadata
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "admin_buyer") {
      return Response.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    /*
     * Ejecuta el middleware en todas las rutas excepto:
     * - archivos estáticos
     * - _next
     * - imágenes
     */
    "/((?!_next|.*\\..*).*)",

    // También protege API routes y server actions
    "/(api|trpc)(.*)",
  ],
};
