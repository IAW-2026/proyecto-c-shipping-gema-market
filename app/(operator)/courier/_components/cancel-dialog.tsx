"use client";

import { X, AlertTriangle } from "lucide-react";

interface CancelDialogProps {
    open: boolean;
    isPending: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function CancelDialog({ open, isPending, onConfirm, onCancel }: CancelDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
            <div className="relative bg-paper rounded-2xl p-6 max-w-sm w-full shadow-xl">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-ink-2 hover:text-ink transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <AlertTriangle size={24} className="text-red-600" />
                </div>

                <h3 className="text-lg font-bold text-ink mb-2">Cancelar misión</h3>
                <p className="text-sm text-ink-2 mb-6 leading-relaxed">
                    El envío volverá a estar disponible para que otro repartidor lo tome.
                    Esta acción no se puede deshacer.
                </p>

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
                        className="flex-1 bg-red-600 text-white h-11 rounded-full text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? "Cancelando..." : "Sí, cancelar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
