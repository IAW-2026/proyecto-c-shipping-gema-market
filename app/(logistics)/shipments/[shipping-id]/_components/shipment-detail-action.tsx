"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { takeShipmentAction, transitionShipmentAction } from "@/lib/features/shipment";

interface ShipmentDetailActionProps {
    shippingId: string;
    label: string;
    mode: "take" | "transition";
    transition?: "pickup" | "transit" | "deliver";
}

export function ShipmentDetailAction({ shippingId, label, mode, transition }: ShipmentDetailActionProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

    const showToast = useCallback((message: string, type: "error" | "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    const handleClick = useCallback(async () => {
        setIsPending(true);
        try {
            const result = mode === "take"
                ? await takeShipmentAction(shippingId)
                : await transitionShipmentAction(shippingId, transition ?? "pickup");

            if (result.success) {
                router.refresh();
            } else {
                showToast(result.error || "Error al ejecutar la acción", "error");
            }
        } catch {
            showToast("Error inesperado al ejecutar la acción", "error");
        } finally {
            setIsPending(false);
        }
    }, [shippingId, mode, transition, router, showToast]);

    return (
        <>
            {toast && (
                <div className={`fixed top-4 right-4 z-[1200] px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
                    toast.type === "error"
                        ? "bg-red-600 text-white"
                        : "bg-green-600 text-white"
                }`}>
                    {toast.message}
                </div>
            )}
            <button
                onClick={handleClick}
                disabled={isPending}
                className="flex-1 bg-clay text-paper h-[42px] px-[18px] rounded-full flex items-center justify-center gap-2 text-sm font-medium hover:bg-cocoa transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Check size={16} />
                )}
                {isPending ? "Procesando..." : label}
            </button>
        </>
    );
}
