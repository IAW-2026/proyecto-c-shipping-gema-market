"use client";

import { useRouter } from "next/navigation";
import { Filter, RefreshCcw, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { takeShipmentAction } from "@/lib/actions/shipment.actions";
import { useFilterDialog } from "./filter-dialog-context";
import { useState } from "react";

export function HeaderActions() {
    const router = useRouter();
    const { open: openFilterDialog } = useFilterDialog();

    const handleRefresh = () => {
        router.refresh();
    };

    const handleFilter = () => {
        openFilterDialog();
    };

    return (
        <div className="flex w-full gap-2">
            <Button variant="secondary" onClick={handleFilter} className="flex-1 lgx:flex-none">
                <Filter size={16} />
                Filtrar
            </Button>
            <Button variant="secondary" onClick={handleRefresh} className="flex-1 lgx:flex-none">
                <RefreshCcw size={16} />
                Refrescar
            </Button>
        </div>
    );
}

export function ViewDetailsButton({ shippingId }: { shippingId: string }) {
    return (
        <Link
            href={`/shipments/${shippingId}`}
            className="flex-1 bg-paper text-ink h-11 rounded-full text-xs font-bold hover:bg-cream transition-all flex items-center justify-center gap-2 active:scale-[0.98] group"
        >
            Ver detalles
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
    );
}

export function TakeShipmentButton({ shippingId }: { shippingId: string }) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

    const showToast = (message: string, type: "error" | "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleTakeShipment = async () => {
        setIsPending(true);
        try {
            const result = await takeShipmentAction(shippingId);
            if (result.success) {
                router.refresh();
            } else {
                showToast(result.error || "Error al tomar el envío", "error");
            }
        } catch (error) {
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
                onClick={handleTakeShipment}
                disabled={isPending}
                className="flex-1 bg-clay text-paper h-11 rounded-full text-xs font-bold hover:bg-cocoa transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <Check size={14} />
                )}
                {isPending ? "Tomando..." : "Tomar envío"}
            </button>
        </>
    );
}