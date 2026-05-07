"use client";

import { useRouter } from "next/navigation";
import { Filter, RefreshCcw, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeaderActions() {
    const router = useRouter();

    const handleRefresh = () => {
        router.refresh();
    };

    const handleFilter = () => {
        console.log("Abrir modal de filtros");
    };

    return (
        <div className="flex w-full gap-2">
            <Button variant="secondary" onClick={handleFilter} className="flex-1 lgx:flex-none">
                <Filter size={16} />
                Filtrar
            </Button>
            <Button variant="secondary" onClick={handleRefresh} className="flex-1 lgx:flex-none">
                <RefreshCcw size={16} />
                Refrescar
            </Button>
        </div>
    );
}

export function ViewDetailsButton({ shippingId }: { shippingId: string }) {
    return (
        <Link
            href={`/shipments/${shippingId}`}
            className="flex-1 bg-paper text-ink h-11 rounded-full text-xs font-bold hover:bg-cream transition-all flex items-center justify-center gap-2 active:scale-[0.98] group"
        >
            Ver detalles
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
    );
}
export function TakeShipmentButton({ shippingId }: { shippingId: string }) {
    const handleTakeShipment = () => {
        // Aquí irá la lógica de la Server Action en la Etapa 3
        console.log(`Intentando tomar el envío: ${shippingId}`);
        alert(`Funcionalidad 'Tomar envío' en desarrollo para el ID: ${shippingId}`);
    };

    return (
        <button
            onClick={handleTakeShipment}
            className="flex-1 bg-clay text-paper h-11 rounded-full text-xs font-bold hover:bg-cocoa transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
            <Check size={14} />
            Tomar envío
        </button>
    );
}