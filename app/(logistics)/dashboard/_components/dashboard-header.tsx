import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "../../_components/page-layout";
import { getAuthenticatedUserId } from "@/lib/auth/get-authenticated-user";

export function DashboardHeaderSkeleton() {
    return (
        <div className="px-4 lgx:px-7 py-5 border-b border-line animate-pulse">
            <div className="h-6 bg-bone rounded w-48 mb-2" />
            <div className="h-4 bg-bone rounded w-32" />
        </div>
    );
}

export async function DashboardHeader() {
    const user = await getAuthenticatedUserId();
    const firstName = user?.full_name?.split(" ")[0] || "Operador";

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
