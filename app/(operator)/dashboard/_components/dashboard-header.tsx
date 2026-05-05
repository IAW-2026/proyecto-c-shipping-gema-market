// app/(operator)/dashboard/_components/dashboard-header.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "../../_components/page-layout";
import { currentUser } from "@clerk/nextjs/server";

export async function DashboardHeader() {
    const user = await currentUser();
    const firstName = user?.firstName || "Operador";

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