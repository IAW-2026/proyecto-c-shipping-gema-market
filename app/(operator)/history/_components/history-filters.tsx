"use client";

import { Search, Calendar } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function HistoryFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) params.set("search", term);
        else params.delete("search");
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex gap-3 flex-wrap items-center mb-6">
            <div className="flex-1 min-w-[280px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink" size={16} />
                <input
                    type="text"
                    placeholder="Buscar por tracking ID..."
                    className="text-ink text-bold w-full bg-paper border border-line rounded-full h-11 pl-10 pr-4  focus:border-clay outline-none transition-colors placeholder:text-ink-3"
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
            <Button variant="secondary">
                <Calendar size={16} />
                Últimos 7 días
            </Button>
        </div>
    );
}