"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { deleteRateAction } from "@/lib/actions/admin.actions";
import { ConfirmDialog } from "../../_components/confirm-dialog";

export function DeleteRateButton({ id, label }: { id: string; label: string }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleConfirm = useCallback(async () => {
        setIsPending(true);
        try {
            const result = await deleteRateAction(id);
            if (!result.success) console.error(result.error);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsPending(false);
            setIsOpen(false);
        }
    }, [id, router]);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
                Eliminar
            </button>

            <ConfirmDialog
                open={isOpen}
                isPending={isPending}
                onConfirm={handleConfirm}
                onCancel={() => setIsOpen(false)}
                title="Eliminar tarifa"
                description={`Se eliminará la tarifa "${label}" del sistema. Esta acción no se puede deshacer.`}
                confirmLabel="Sí, eliminar"
                variant="danger"
            />
        </>
    );
}
