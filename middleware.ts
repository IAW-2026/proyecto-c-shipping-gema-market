// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Rutas que no requieren autenticación (ej: tracking público)
const isPublicRoute = createRouteMatcher(['/tracking(.*)']);

// Rutas exclusivas para usuarios NO autenticados (Login/Registro)
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

// Rutas viejas que redirigen a las nuevas
const isOldAuthRoute = createRouteMatcher(['/login(.*)', '/register(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // 0. Redirigir rutas viejas /login y /register a /sign-in y /sign-up
  if (isOldAuthRoute(req)) {
    const newPath = pathname.replace('/login', '/sign-in').replace('/register', '/sign-up');
    return NextResponse.redirect(new URL(newPath, req.url));
  }

  // 1. Lógica para usuarios autenticados intentando entrar a Login o Registro
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 2. Lógica para usuarios NO autenticados intentando entrar a rutas protegidas
  if (!userId && !isPublicRoute(req) && !isAuthRoute(req)) {
    const loginUrl = new URL('/sign-in', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Redirección de la raíz / al contexto correspondiente
  if (pathname === '/') {
    const target = userId ? '/dashboard' : '/sign-in';
    return NextResponse.redirect(new URL(target, req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};