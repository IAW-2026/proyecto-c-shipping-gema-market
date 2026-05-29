"use client";

import { useCallback } from "react";
import { deleteShipmentAction } from "@/lib/features/admin/actions";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteShipmentButton({ id, tracking }: { id: string; tracking: string }) {
    const { isOpen, isPending, open, close, handleConfirm } = useConfirmAction(
        useCallback(() => deleteShipmentAction(id), [id])
    );

    return (
        <>
            <button
                type="button"
                onClick={open}
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
                onCancel={close}
                title="Eliminar envío"
                description={`Se eliminará el envío ${tracking} del sistema. Esta acción no se puede deshacer.`}
                confirmLabel="Sí, eliminar"
                variant="danger"
            />
        </>
    );
}
