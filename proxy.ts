// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Rutas que no requieren autenticación (ej: tracking público)
const isPublicRoute = createRouteMatcher(['/tracking(.*)', '/api/webhook/clerk']);

// Rutas exclusivas para usuarios NO autenticados (Login/Registro)
const isAuthRoute = createRouteMatcher(['/login(.*)', '/register(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // 1. Lógica para usuarios autenticados intentando entrar a Login o Registro
  if (userId && isAuthRoute(req)) {
    // Redirigimos al dashboard porque el usuario ya tiene una sesión válida
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 2. Lógica para usuarios NO autenticados intentando entrar a rutas protegidas
  if (!userId && !isPublicRoute(req) && !isAuthRoute(req)) {
    // Si no está logueado y la ruta no es pública ni de auth, va a login
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Redirección de la raíz / al contexto correspondiente
  if (pathname === '/') {
    const target = userId ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(target, req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};