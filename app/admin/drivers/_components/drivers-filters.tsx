"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "@/components/ui/search-input";

const FILTERS = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Activos" },
    { value: "banned", label: "Baneados" },
] as const;

export function DriversFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const current = searchParams.get("banned") || "all";

    const handleFilter = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === "all") {
            params.delete("banned");
        } else {
            params.set("banned", value);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex gap-3 flex-wrap items-center mb-6">
            <SearchInput placeholder="Buscar por nombre..." />
            <div className="flex gap-1 bg-bone rounded-full p-1">
                {FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => handleFilter(f.value)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                            current === f.value
                                ? "bg-paper text-ink shadow-sm"
                                : "text-ink-3 hover:text-ink"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
