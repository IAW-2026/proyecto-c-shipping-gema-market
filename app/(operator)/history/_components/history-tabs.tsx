"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";

interface HistoryTabsProps {
    counts: {
        all: number;
        active: number;
        delivered: number;
        issues: number;
    };
}

export function HistoryTabs({ counts }: HistoryTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Obtenemos el estado actual de la URL o por defecto "todos"
    const activeTab = searchParams.get("status") || "todos";

    const tabs = [
        { id: "todos", label: "Todos", count: counts.all },
        { id: "activos", label: "Activos", count: counts.active },
        { id: "entregados", label: "Entregados", count: counts.delivered },
        { id: "problemas", label: "Con problemas", count: counts.issues },
    ];

    const handleTabChange = (id: string) => {
        const params = new URLSearchParams(searchParams);
        if (id === "todos") {
            params.delete("status");
        } else {
            params.set("status", id);
        }
        // Sincronizamos la URL sin recargar la página completa
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="mb-6">
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
        </div>
    );
}