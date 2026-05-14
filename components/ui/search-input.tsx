"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchInputProps {
    placeholder?: string;
    paramName?: string;
}

export function SearchInput({
    placeholder = "Buscar...",
    paramName = "search",
}: SearchInputProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set(paramName, term);
        } else {
            params.delete(paramName);
        }
        params.delete("page");
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex-1 min-w-[280px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink" size={16} />
            <input
                type="text"
                placeholder={placeholder}
                defaultValue={searchParams.get(paramName) ?? ""}
                className="text-ink w-full bg-paper border border-line rounded-full h-11 pl-10 pr-4 focus:border-clay outline-none transition-colors placeholder:text-ink-3"
                onChange={(e) => handleChange(e.target.value)}
            />
        </div>
    );
}
