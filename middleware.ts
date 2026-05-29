import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ROLES } from "@/lib/types/auth";

// Rutas públicas (no requieren autenticación)
const isPublicRoute = createRouteMatcher([
    '/track(.*)',
    '/api(.*)',
    '/dev(.*)',
    '/_next(.*)',
    '/favicon.ico',
]);

// Rutas de autenticación (solo para no autenticados)
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

// Rutas de logística
const isLogisticsRoute = createRouteMatcher([
    '/dashboard',
    '/courier',
    '/available',
    '/history',
    '/settlements',
    '/shipments(.*)',
]);

// Rutas de admin
const isAdminRoute = createRouteMatcher([
    '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth();
    const { pathname } = req.nextUrl;

    const role = (sessionClaims as any)?.metadata?.role as string | undefined;

    const response = NextResponse.next();

    // 1. Rutas públicas: permitir sin importar auth
    if (isPublicRoute(req)) {
        return response;
    }

    // 2. Usuario no autenticado
    if (!userId) {
        if (isAuthRoute(req)) {
            return response;
        }
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // 3. Usuario autenticado sin rol definido
    if (!role) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // 3b. Usuario con rol ajeno al dominio de la app
    if (role !== ROLES.LOGISTICS && role !== ROLES.ADMIN_LOGISTICS) {
        if (pathname === "/unauthorized") return response;
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // 4. Usuario autenticado en ruta de auth → redirigir a su dashboard
    if (isAuthRoute(req)) {
        const target = role === "admin_logistics" ? "/admin/dashboard" : "/dashboard";
        return NextResponse.redirect(new URL(target, req.url));
    }

    // 5. Usuario logistics en ruta de admin
    if (role === "logistics" && isAdminRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 6. Usuario logistics en unauthorized
    if (role === "logistics" && pathname === "/unauthorized") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 7. Usuario admin_logistics en rutas de logística
    if (role === "admin_logistics" && isLogisticsRoute(req)) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // 8. Usuario admin_logistics en unauthorized
    if (role === "admin_logistics" && pathname === "/unauthorized") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return response;
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
