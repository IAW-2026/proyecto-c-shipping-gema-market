"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRateAction } from "@/lib/actions/admin.actions";
import { Plus } from "lucide-react";

export function CreateRateForm() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const min = Number(formData.get("weightMin"));
        const max = Number(formData.get("weightMax"));
        const price = Number(formData.get("pricePerKm"));

        setIsPending(true);
        try {
            const result = await createRateAction(min, max, price);
            if (!result.success) {
                setError(result.error ?? "Error desconocido");
            } else {
                form.reset();
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            setError("Error inesperado");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <div>
                <label className="text-xs text-ink-2 block mb-1">Peso min (kg)</label>
                <input
                    type="number"
                    name="weightMin"
                    required
                    step="0.01"
                    min="0"
                    className="w-28 text-sm px-3 py-2 border border-line rounded-xl bg-transparent text-ink-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
            </div>
            <div>
                <label className="text-xs text-ink-2 block mb-1">Peso max (kg)</label>
                <input
                    type="number"
                    name="weightMax"
                    required
                    step="0.01"
                    min="0"
                    className="w-28 text-sm px-3 py-2 border border-line rounded-xl bg-transparent text-ink-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
            </div>
            <div>
                <label className="text-xs text-ink-2 block mb-1">Precio por km (USD)</label>
                <input
                    type="number"
                    name="pricePerKm"
                    required
                    step="0.01"
                    min="0"
                    className="w-28 text-sm px-3 py-2 border border-line rounded-xl bg-transparent text-ink-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
            </div>
            <button
                type="submit"
                disabled={isPending}
                className="text-sm bg-cocoa text-paper px-4 py-2 rounded-xl font-medium hover:bg-cocoa/90 transition-colors disabled:opacity-50"
            >
                {isPending ? "Creando..." : "Crear tarifa"}
            </button>
            {error && (
                <div className="w-full text-xs text-red-600 font-medium">{error}</div>
            )}
        </form>
    );
}
