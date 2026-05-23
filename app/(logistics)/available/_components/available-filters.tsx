"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilterDialog } from "./filter-dialog-context";
import { useState, useEffect, useTransition } from "react";

export function AvailableFiltersDialog() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isOpen, close: closeDialog } = useFilterDialog();
    const [isPending, startTransition] = useTransition();

    const [weightMin, setWeightMin] = useState(searchParams.get("weightMin") ?? "");
    const [weightMax, setWeightMax] = useState(searchParams.get("weightMax") ?? "");
    const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") ?? "");
    const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") ?? "");
    const [distanceMin, setDistanceMin] = useState(searchParams.get("distanceMin") ?? "");
    const [distanceMax, setDistanceMax] = useState(searchParams.get("distanceMax") ?? "");

    useEffect(() => {
        if (!isOpen) return;
        setWeightMin(searchParams.get("weightMin") ?? "");
        setWeightMax(searchParams.get("weightMax") ?? "");
        setPriceMin(searchParams.get("priceMin") ?? "");
        setPriceMax(searchParams.get("priceMax") ?? "");
        setDistanceMin(searchParams.get("distanceMin") ?? "");
        setDistanceMax(searchParams.get("distanceMax") ?? "");
    }, [isOpen, searchParams]);

    const applyFilters = () => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            if (weightMin) params.set("weightMin", weightMin);
            else params.delete("weightMin");
            if (weightMax) params.set("weightMax", weightMax);
            else params.delete("weightMax");
            if (priceMin) params.set("priceMin", priceMin);
            else params.delete("priceMin");
            if (priceMax) params.set("priceMax", priceMax);
            else params.delete("priceMax");
            if (distanceMin) params.set("distanceMin", distanceMin);
            else params.delete("distanceMin");
            if (distanceMax) params.set("distanceMax", distanceMax);
            else params.delete("distanceMax");
            closeDialog();
            router.push(`?${params.toString()}`);
        });
    };

    const clearFilters = () => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            params.delete("weightMin");
            params.delete("weightMax");
            params.delete("priceMin");
            params.delete("priceMax");
            params.delete("distanceMin");
            params.delete("distanceMax");
            closeDialog();
            router.push(`?${params.toString()}`);
        });
    };

    if (!isOpen) return null;

    const sectionPadding = "px-7 py-6";

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={closeDialog} />
            <div className="relative bg-paper rounded-[22px] w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-xl border border-line">
                <div className={`flex items-center justify-between ${sectionPadding} border-b border-line`}>
                    <h2 className="text-lg font-bold text-ink">Filtros</h2>
                    <button onClick={closeDialog} className="text-ink-3 hover:text-ink transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className={`${sectionPadding} space-y-6`}>
                    <Section label="Peso (kg)">
                        <div className="flex gap-3">
                            <NumberInput
                                placeholder="Mín"
                                value={weightMin}
                                onChange={setWeightMin}
                            />
                            <NumberInput
                                placeholder="Máx"
                                value={weightMax}
                                onChange={setWeightMax}
                            />
                        </div>
                    </Section>

                    <Section label="Valor ($)">
                        <div className="flex gap-3">
                            <NumberInput
                                placeholder="Mín"
                                value={priceMin}
                                onChange={setPriceMin}
                            />
                            <NumberInput
                                placeholder="Máx"
                                value={priceMax}
                                onChange={setPriceMax}
                            />
                        </div>
                    </Section>

                    <Section label="Distancia (km)">
                        <div className="flex gap-3">
                            <NumberInput
                                placeholder="Mín"
                                value={distanceMin}
                                onChange={setDistanceMin}
                            />
                            <NumberInput
                                placeholder="Máx"
                                value={distanceMax}
                                onChange={setDistanceMax}
                            />
                        </div>
                    </Section>
                </div>

                <div className={`flex gap-3 ${sectionPadding} border-t border-line`}>
                    <Button variant="secondary" onClick={clearFilters} className="flex-1" disabled={isPending}>
                        Limpiar
                    </Button>
                    <Button variant="primary" onClick={applyFilters} className="flex-1" disabled={isPending}>
                        {isPending ? "Aplicando..." : "Aplicar"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs font-bold text-ink-3 uppercase tracking-wider mb-2">{label}</p>
            {children}
        </div>
    );
}

function NumberInput({
    placeholder,
    value,
    onChange,
}: {
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <input
            type="number"
            min={0}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 text-ink bg-bone border border-line rounded-full h-10 px-4 text-sm outline-none focus:border-clay transition-colors placeholder:text-ink-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
    );
}
