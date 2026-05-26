"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/shared/utils";
import { transitionShipmentAction } from "@/lib/actions/shipment.actions";
import type { ShipmentSummary } from "@/lib/definitions/shipments";

// --- Cancel button (recibe props, no contexto) ---

export function CancelButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
    return (
        <>
            <span
                onClick={onClick}
                className={cn(
                    "hidden lgx:inline text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-colors",
                    disabled
                        ? "text-ink-3 cursor-not-allowed"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50"
                )}
            >
                Cancelar
            </span>
            <button
                onClick={onClick}
                disabled={disabled}
                className={cn(
                    "lgx:hidden p-2 cursor-pointer transition-colors",
                    disabled ? "text-ink-3 cursor-not-allowed" : "text-red-600 hover:text-red-700"
                )}
            >
                <X size={20} />
            </button>
        </>
    );
}

// --- Shipment selector (navega via URL, no contexto) ---

export function ShipmentSelector({ shipments, selectedTracking }: { shipments: ShipmentSummary[]; selectedTracking: string }) {
    const router = useRouter();

    return (
        <div className="relative">
            <select
                value={selectedTracking}
                onChange={(e) => router.push(`/courier?tracking=${e.target.value}`)}
                className="appearance-none bg-paper border border-line rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-clay/30 min-w-[200px]"
            >
                {shipments.map((s) => (
                    <option key={s.shippingId} value={s.trackingCode}>
                        {s.trackingCode}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none"
            />
        </div>
    );
}

// --- Botón de acción principal (ya recibía props, sin cambios) ---

export function ChangeStateButton({ isPending, label, onClick }: { isPending: boolean; label: string; onClick: () => void }) {
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

// --- Hook standalone para manejar acciones (sin contexto) ---

export function useCourierActions() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const handleAction = async (shippingId: string, transition: "pickup" | "transit" | "deliver") => {
        setIsPending(true);
        try {
            const result = await transitionShipmentAction(shippingId, transition);
            if (!result.success) console.error(result.error);
        } catch (error) {
            console.error("Error al ejecutar acción:", error);
        } finally {
            router.refresh();
            setIsPending(false);
        }
    };

    const handleCancel = async (shippingId: string) => {
        setIsPending(true);
        try {
            const result = await transitionShipmentAction(shippingId, "cancel");
            if (!result.success) console.error(result.error);
        } catch (error) {
            console.error("Error al cancelar:", error);
        } finally {
            router.refresh();
            setIsPending(false);
        }
    };

    return { isPending, handleAction, handleCancel };
}
