// app/(operator)/dashboard/_components/dashboard-header.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "../../_components/page-layout";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function DashboardHeader() {
    const { userId } = await auth();
    let firstName = "Operador";

    if (userId) {
        try {
            const client = await clerkClient();
            const user = await client.users.getUser(userId);
            firstName = user.firstName || "Operador";
        } catch {
            // Fallback si Clerk aún no propagó el usuario
        }
    }

    const takeShipmentButton = (
        <Link
            href="/available"
            className="bg-clay text-paper h-[42px] px-[18px] rounded-full flex items-center gap-2 text-sm font-medium hover:bg-cocoa transition-colors"
        >
            <Plus size={18} />
            Tomar envíos
        </Link>
    );

    return (
        <Header
            title={`Buen día, ${firstName}`}
            subtitle="Centro de Operaciones"
            action={takeShipmentButton}
        />
    );
}