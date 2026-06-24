"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "@/components/ui/search-input";

const STATUS_FILTERS = [
    { value: "all", label: "Todos" },
    { value: "waiting_for_courier", label: "Esperando repartidor" },
    { value: "pending_pickup", label: "Pendiente de retiro" },
    { value: "picked_up", label: "Retirado" },
    { value: "in_transit", label: "En viaje" },
    { value: "delivered", label: "Entregado" },
] as const;

export function ShipmentsFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const current = searchParams.get("status") || "all";

    const handleFilter = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === "all") {
            params.delete("status");
        } else {
            params.set("status", value);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex gap-3 flex-wrap items-center">
            <SearchInput placeholder="Buscar por shipping ID..." paramName="search" />
            <div className="flex gap-1 bg-bone rounded-full p-1 overflow-x-auto">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => handleFilter(f.value)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
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
