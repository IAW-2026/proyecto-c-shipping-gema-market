"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { takeShipmentAction } from "@/lib/actions/shipment.actions";

export function TakeShipmentAction({ shippingId }: { shippingId: string }) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

    const showToast = (message: string, type: "error" | "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleTake = async () => {
        setIsPending(true);
        try {
            const result = await takeShipmentAction(shippingId);
            if (result.success) {
                router.refresh();
            } else {
                showToast(result.error || "Error al tomar el envío", "error");
            }
        } catch {
            showToast("Error inesperado al tomar el envío", "error");
        } finally {
            setIsPending(false);
        }
    };

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
                onClick={handleTake}
                disabled={isPending}
                className="flex-1 bg-clay text-paper h-[42px] px-[18px] rounded-full flex items-center justify-center gap-2 text-sm font-medium hover:bg-cocoa transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Check size={16} />
                )}
                {isPending ? "Tomando..." : "Tomar envío"}
            </button>
        </>
    );
}
