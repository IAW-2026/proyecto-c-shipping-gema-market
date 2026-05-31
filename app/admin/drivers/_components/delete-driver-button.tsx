"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteDriverAction } from "@/lib/features/admin/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader2 } from "lucide-react";

export function DeleteDriverButton({ id, fullName }: { id: string; fullName: string }) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

    const showToast = (message: string, type: "error" | "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleConfirm = async () => {
        setIsPending(true);
        try {
            const result = await deleteDriverAction(id);
            if (result.success) {
                router.refresh();
            } else {
                showToast(result.error || "Error desconocido", "error");
            }
        } catch {
            showToast("Error inesperado", "error");
        } finally {
            setIsPending(false);
            setIsDialogOpen(false);
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
                type="button"
                onClick={() => setIsDialogOpen(true)}
                disabled={isPending}
                className="text-xs font-medium text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : "Eliminar"}
            </button>

            <ConfirmDialog
                open={isDialogOpen}
                isPending={isPending}
                onConfirm={handleConfirm}
                onCancel={() => setIsDialogOpen(false)}
                title="Eliminar repartidor"
                description={`Se eliminará a "${fullName}" y sus envíos activos serán desasignados. Esta acción no se puede deshacer.`}
                confirmLabel="Sí, eliminar"
                variant="danger"
            />
        </>
    );
}
