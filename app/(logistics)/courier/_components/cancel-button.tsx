"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/shared/classnames";

interface CancelButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function CancelButton({ onClick, disabled }: CancelButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "cursor-pointer transition-colors",
                "lgx:text-xs lgx:font-semibold lgx:px-3 lgx:py-1.5 lgx:rounded-full lgx:inline-flex lgx:items-center",
                disabled
                    ? "text-ink-3 cursor-not-allowed"
                    : "text-red-600 hover:text-red-700 lgx:hover:bg-red-50"
            )}
        >
            <span className="hidden lgx:inline">Cancelar</span>
            <X size={20} className="lgx:hidden" />
        </button>
    );
}
