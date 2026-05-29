"use client";

import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    isPending: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    variant?: "danger" | "warning";
}

export function ConfirmDialog({
    open,
    isPending,
    onConfirm,
    onCancel,
    title,
    description,
    confirmLabel = "Confirmar",
    variant = "danger",
}: ConfirmDialogProps) {
    if (!open) return null;

    const confirmColor =
        variant === "danger"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-amber-600 hover:bg-amber-700";

    const dialog = (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
            <div className="relative bg-paper rounded-2xl p-6 max-w-sm w-full shadow-xl">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-ink-2 hover:text-ink transition-colors"
                >
                    <X size={20} />
                </button>

                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    variant === "danger" ? "bg-red-100" : "bg-amber-100"
                }`}>
                    <AlertTriangle size={24} className={variant === "danger" ? "text-red-600" : "text-amber-600"} />
                </div>

                <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
                <p className="text-sm text-ink-2 mb-6 leading-relaxed">{description}</p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isPending}
                        className="flex-1 bg-paper text-ink border border-line h-11 rounded-full text-sm font-bold hover:bg-cream transition-all disabled:opacity-50"
                    >
                        No, volver
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        className={`flex-1 text-white h-11 rounded-full text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${confirmColor}`}
                    >
                        {isPending ? "Procesando..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof window === "undefined") return null;
    return createPortal(dialog, document.body);
}
