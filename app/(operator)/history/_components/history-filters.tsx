"use client";

import { Calendar } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";

export function HistoryFilters() {
    return (
        <div className="flex gap-3 flex-wrap items-center mb-6">
            <SearchInput placeholder="Buscar por tracking ID..." />
            <Button variant="secondary">
                <Calendar size={16} />
                Últimos 7 días
            </Button>
        </div>
    );
}