"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, ArrowDown } from "lucide-react";

interface SortableHeaderProps {
    label: string;
    sortKey: string;
    className?: string;
}

export function SortableHeader({ label, sortKey, className = "" }: SortableHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSortBy = searchParams.get("sortBy");
    const currentSortOrder = searchParams.get("sortOrder") || "desc";
    const isActive = currentSortBy === sortKey;
    const nextOrder = isActive && currentSortOrder === "asc" ? "desc" : "asc";

    const handleClick = () => {
        const params = new URLSearchParams(searchParams);
        params.set("sortBy", sortKey);
        params.set("sortOrder", nextOrder);
        router.push(`?${params.toString()}`);
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-1 font-medium hover:text-ink transition-colors cursor-pointer ${className} ${isActive ? "text-ink" : ""}`}
        >
            {label}
            {isActive && (
                currentSortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
            )}
        </button>
    );
}
