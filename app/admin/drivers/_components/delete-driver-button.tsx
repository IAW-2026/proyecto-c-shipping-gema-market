"use client";

import { useCallback } from "react";
import { deleteDriverAction } from "@/lib/features/admin/actions";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteDriverButton({ id, fullName }: { id: string; fullName: string }) {
    const { isOpen, isPending, open, close, handleConfirm } = useConfirmAction(
        useCallback(() => deleteDriverAction(id), [id])
    );

    return (
        <>
            <button
                type="button"
                onClick={open}
                className="text-xs font-medium text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
                Eliminar
            </button>

            <ConfirmDialog
                open={isOpen}
                isPending={isPending}
                onConfirm={handleConfirm}
                onCancel={close}
                title="Eliminar repartidor"
                description={`Se eliminará a "${fullName}" y sus envíos activos serán desasignados. Esta acción no se puede deshacer.`}
                confirmLabel="Sí, eliminar"
                variant="danger"
            />
        </>
    );
}
