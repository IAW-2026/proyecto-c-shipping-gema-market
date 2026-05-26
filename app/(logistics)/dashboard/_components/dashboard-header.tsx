import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "../../_components/page-layout";
import { auth } from "@clerk/nextjs/server";
import { getUserFromCache } from "@/lib/auth/user-cache";

export async function DashboardHeader() {
    const { userId: clerkUserId } = await auth();
    const cached = clerkUserId ? getUserFromCache(clerkUserId) : null;
    const firstName = cached?.firstName || "Operador";

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
