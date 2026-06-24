"use client";

import { SearchInput } from "@/components/ui/search-input";

export function HistoryFilters() {
    return (
        <div className="flex gap-3 flex-wrap items-center mb-6">
            <SearchInput placeholder="Buscar por shipping ID..." />
        </div>
    );
}