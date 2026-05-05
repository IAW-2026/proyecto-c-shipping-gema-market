// app/(operator)/layout.tsx
import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ROLES, UserRole } from "@/lib/shared/auth-constants";
import { OperatorSidebar } from "./_components/Sidebar";
import { MobileNav } from "./_components/MobileNav";


export default async function OperatorLayout({ children }: { children: ReactNode }) {
    // 1. Verificación de Identidad y Roles en la capa más alta del módulo
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const userRole = (sessionClaims?.metadata as any)?.role as UserRole;

    if (userRole !== ROLES.LOGISTICS && userRole !== ROLES.ADMIN) {
        // Si un comprador intenta entrar a la ruta de operadores, lo expulsamos
        redirect("/unauthorized");
    }

    // 2. Estructura Persistente
    return (
        <div className="flex min-h-screen bg-cream">
            <OperatorSidebar />

            <main className="flex-1 min-w-0 flex flex-col lgx:ml-[240px] lgx:w-[calc(100%-240px)] pb-16 lgx:pb-0">
                {/* El contenido dinámico de cada página (page.tsx) se inyecta aquí */}
                {children}
            </main>

            <MobileNav />
        </div>
    );
}