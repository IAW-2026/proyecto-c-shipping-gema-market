"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { unassignDriverAction } from "@/lib/actions/admin.actions";
import { ConfirmDialog } from "../../_components/confirm-dialog";
import { UserX } from "lucide-react";

export function UnassignShipmentButton({ id, tracking }: { id: string; tracking: string }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleConfirm = useCallback(async () => {
        setIsPending(true);
        try {
            const result = await unassignDriverAction(id);
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
                className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
            >
                <UserX size={14} />
                Desasignar
            </button>

            <ConfirmDialog
                open={isOpen}
                isPending={isPending}
                onConfirm={handleConfirm}
                onCancel={() => setIsOpen(false)}
                title="Desasignar repartidor"
                description={`El envío ${tracking} volverá a estar disponible. Solo aplica para pedidos pendientes de retiro.`}
                confirmLabel="Sí, desasignar"
                variant="warning"
            />
        </>
    );
}
