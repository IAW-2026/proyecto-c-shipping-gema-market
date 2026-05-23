import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ROLES } from "@/lib/definitions/auth";
import { requireRole } from "@/lib/auth/rbac";
import { AdminSidebar } from "./_components/Sidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const result = await requireRole([ROLES.ADMIN_LOGISTICS]);

    if (!result) {
        redirect("/sign-in");
    }

    return (
        <div className="flex min-h-screen bg-cream">
            <AdminSidebar />

            <main className="flex-1 min-w-0 flex flex-col lgx:ml-[240px] lgx:w-[calc(100%-240px)] pb-[72px] lgx:pb-0">
                {children}
            </main>
        </div>
    );
}
