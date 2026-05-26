"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toggleBanAction } from "@/lib/actions/admin.actions";
import { ConfirmDialog } from "../../_components/confirm-dialog";

export function ToggleBanButton({ id, banned, fullName }: { id: string; banned: boolean; fullName: string }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleConfirm = useCallback(async () => {
        setIsPending(true);
        try {
            const result = await toggleBanAction(id, !banned);
            if (!result.success) console.error(result.error);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsPending(false);
            setIsOpen(false);
        }
    }, [id, banned, router]);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
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
                onCancel={() => setIsOpen(false)}
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
