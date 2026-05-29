"use client";

import { Loader2 } from "lucide-react";

interface ChangeStateButtonProps {
    isPending: boolean;
    label: string;
    onClick: () => void;
}

export function ChangeStateButton({ isPending, label, onClick }: ChangeStateButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={isPending}
            className="w-full bg-clay text-paper h-14 rounded-2xl text-base font-bold hover:bg-cocoa transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
        >
            {isPending ? <Loader2 size={20} className="animate-spin" /> : <span>{label}</span>}
        </button>
    );
}
