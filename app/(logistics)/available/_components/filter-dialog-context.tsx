"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FilterDialogContextValue {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

const FilterDialogContext = createContext<FilterDialogContextValue | null>(null);

export function FilterDialogProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <FilterDialogContext.Provider
            value={{
                isOpen,
                open: () => setIsOpen(true),
                close: () => setIsOpen(false),
            }}
        >
            {children}
        </FilterDialogContext.Provider>
    );
}

export function useFilterDialog() {
    const ctx = useContext(FilterDialogContext);
    if (!ctx) throw new Error("useFilterDialog must be used within FilterDialogProvider");
    return ctx;
}
