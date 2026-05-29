"use client";

import { useCallback } from "react";
import { unassignDriverAction } from "@/lib/features/admin/actions";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UserX } from "lucide-react";

export function UnassignShipmentButton({ id, tracking }: { id: string; tracking: string }) {
    const { isOpen, isPending, open, close, handleConfirm } = useConfirmAction(
        useCallback(() => unassignDriverAction(id), [id])
    );

    return (
        <>
            <button
                type="button"
                onClick={open}
                className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
            >
                <UserX size={14} />
                Desasignar
            </button>

            <ConfirmDialog
                open={isOpen}
                isPending={isPending}
                onConfirm={handleConfirm}
                onCancel={close}
                title="Desasignar repartidor"
                description={`El envío ${tracking} volverá a estar disponible. Solo aplica para pedidos pendientes de retiro.`}
                confirmLabel="Sí, desasignar"
                variant="warning"
            />
        </>
    );
}
