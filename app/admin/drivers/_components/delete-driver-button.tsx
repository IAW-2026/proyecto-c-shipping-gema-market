"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { deleteDriverAction } from "@/lib/actions/admin.actions";
import { ConfirmDialog } from "../../_components/confirm-dialog";

export function DeleteDriverButton({ id, fullName }: { id: string; fullName: string }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleConfirm = useCallback(async () => {
        setIsPending(true);
        try {
            const result = await deleteDriverAction(id);
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
                className="text-xs font-medium text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
                Eliminar
            </button>

            <ConfirmDialog
                open={isOpen}
                isPending={isPending}
                onConfirm={handleConfirm}
                onCancel={() => setIsOpen(false)}
                title="Eliminar repartidor"
                description={`Se eliminará a "${fullName}" y sus envíos activos serán desasignados. Esta acción no se puede deshacer.`}
                confirmLabel="Sí, eliminar"
                variant="danger"
            />
        </>
    );
}
