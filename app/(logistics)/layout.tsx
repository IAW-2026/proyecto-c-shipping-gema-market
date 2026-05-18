// app/(operator)/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ROLES } from "@/lib/definitions/auth";
import { requireRole } from "@/lib/auth/rbac";
import { OperatorSidebar } from "./_components/Sidebar";
import { MobileNav } from "./_components/MobileNav";


export default async function OperatorLayout({ children }: { children: ReactNode }) {
    const result = await requireRole([ROLES.LOGISTICS]);

    if (!result) {
        redirect("/login");
    }

    // 2. Estructura Persistente
    return (
        <div className="flex min-h-screen bg-cream">
            <OperatorSidebar />

            <main className="flex-1 min-w-0 flex flex-col lgx:ml-[240px] lgx:w-[calc(100%-240px)] pb-[72px] lgx:pb-0">
                {/* El contenido dinámico de cada página (page.tsx) se inyecta aquí */}
                {children}
            </main>

            <MobileNav />
        </div>
    );
}