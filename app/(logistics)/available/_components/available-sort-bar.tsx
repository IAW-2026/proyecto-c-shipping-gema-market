"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { useTransition } from "react";

type SortField = "price" | "distance" | "weight" | "created_at";

const SORT_OPTIONS: { value: SortField; label: string }[] = [
    { value: "price", label: "Valor" },
    { value: "distance", label: "Distancia" },
    { value: "weight", label: "Peso" },
    { value: "created_at", label: "Fecha" },
];

export function AvailableSortBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const activeSortBy = (searchParams.get("sortBy") || "created_at") as SortField;
    const activeSortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const handleSort = (field: SortField) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            params.set("sortBy", field);
            params.set("sortOrder", activeSortOrder);
            router.push(`?${params.toString()}`);
        });
    };

    const toggleOrder = () => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            const newOrder = activeSortOrder === "asc" ? "desc" : "asc";
            params.set("sortOrder", newOrder);
            if (!params.has("sortBy")) params.set("sortBy", "created_at");
            router.push(`?${params.toString()}`);
        });
    };

    const loading = isPending ? "opacity-60 pointer-events-none" : "";

    return (
        <div className={`flex items-center gap-2 flex-wrap transition-opacity ${loading}`}>
            {SORT_OPTIONS.map((opt) => {
                const isActive = activeSortBy === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => handleSort(opt.value)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                            isActive
                                ? "bg-clay text-paper border-clay"
                                : "bg-paper text-ink-3 border-line hover:text-ink hover:border-clay"
                        }`}
                    >
                        {opt.label}
                    </button>
                );
            })}
            <div className="w-px h-6 bg-line mx-1" />
            <button
                onClick={toggleOrder}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border bg-paper text-ink-3 border-line hover:text-ink hover:border-clay"
            >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpDown size={14} />}
                {activeSortOrder === "asc" ? "Ascendente" : "Descendente"}
            </button>
        </div>
    );
}
