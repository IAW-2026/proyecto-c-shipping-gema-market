"use client";

import { useRouter } from "next/navigation";
import { Filter, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AvailableActions() {
    const router = useRouter();

    const handleRefresh = () => {
        // Obliga a Next.js a re-ejecutar las consultas a la base de datos en los Server Components
        router.refresh();
    };

    const handleFilter = () => {
        // En la Etapa 3, aquí modificaremos los searchParams de la URL (ej: ?zona=centro)
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