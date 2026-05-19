"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(page));
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center justify-center w-9 h-9 rounded-full text-ink-3 hover:text-ink hover:bg-cream transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
                <ChevronLeft size={18} />
            </button>

            {start > 1 && (
                <>
                    <button
                        onClick={() => goToPage(1)}
                        className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium text-ink-3 hover:text-ink hover:bg-cream transition-colors"
                    >
                        1
                    </button>
                    {start > 2 && <span className="text-ink-3 px-1">...</span>}
                </>
            )}

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                        page === currentPage
                            ? "bg-clay text-paper"
                            : "text-ink-3 hover:text-ink hover:bg-cream"
                    }`}
                >
                    {page}
                </button>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="text-ink-3 px-1">...</span>}
                    <button
                        onClick={() => goToPage(totalPages)}
                        className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium text-ink-3 hover:text-ink hover:bg-cream transition-colors"
                    >
                        {totalPages}
                    </button>
                </>
            )}

            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center justify-center w-9 h-9 rounded-full text-ink-3 hover:text-ink hover:bg-cream transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
