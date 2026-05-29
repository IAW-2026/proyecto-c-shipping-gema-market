"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";

interface HistoryTabsProps {
    counts: {
        all: number;
        active: number;
        delivered: number;
    };
}

export function HistoryTabs({ counts }: HistoryTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const activeTab = searchParams.get("status") || "todos";

    const tabs = [
        { id: "todos", label: "Todos", count: counts.all },
        { id: "active", label: "Activos", count: counts.active },
        { id: "delivered", label: "Entregados", count: counts.delivered },
    ];

    const handleTabChange = (id: string) => {
        const params = new URLSearchParams(searchParams);
        if (id === "todos") {
            params.delete("status");
        } else {
            params.set("status", id);
        }
        params.delete("page");
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