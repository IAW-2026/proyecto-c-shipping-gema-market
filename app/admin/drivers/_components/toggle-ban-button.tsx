"use client";

import { useCallback } from "react";
import { toggleBanAction } from "@/lib/actions/admin.actions";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function ToggleBanButton({ id, banned, fullName }: { id: string; banned: boolean; fullName: string }) {
    const { isOpen, isPending, open, close, handleConfirm } = useConfirmAction(
        useCallback(() => toggleBanAction(id, !banned), [id, banned])
    );

    return (
        <>
            <button
                type="button"
                onClick={open}
                className={`text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
                    banned
                        ? "text-green-600 hover:bg-green-50"
                        : "text-amber-600 hover:bg-amber-50"
                }`}
            >
                {banned ? "Desbanear" : "Banear"}
            </button>

            <ConfirmDialog
                open={isOpen}
                isPending={isPending}
                onConfirm={handleConfirm}
                onCancel={close}
                title={banned ? "Desbanear repartidor" : "Banear repartidor"}
                description={
                    banned
                        ? `"${fullName}" podrá tomar envíos nuevamente.`
                        : `"${fullName}" no podrá tomar nuevos envíos. Los envíos activos no se verán afectados.`
                }
                confirmLabel={banned ? "Sí, desbanear" : "Sí, banear"}
                variant="warning"
            />
        </>
    );
}
