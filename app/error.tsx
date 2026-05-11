"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Registrar el error en un servicio de monitoreo (ej: Sentry)
        console.error("Critical Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6">
            <div className="max-w-[480px] w-full text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <AlertCircle size={40} />
                </div>

                <h1 className="text-[32px] font-bold text-ink tracking-tight mb-4">
                    Algo salió mal
                </h1>
                <p className="text-ink-3 text-base mb-10 leading-relaxed">
                    Lo sentimos, ocurrió un error inesperado en el sistema. 
                    Nuestro equipo técnico ha sido notificado.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => reset()} className="gap-2">
                        <RotateCcw size={18} />
                        Reintentar
                    </Button>
                    <Link href="/">
                        <Button variant="secondary" className="w-full sm:w-auto gap-2">
                            <Home size={18} />
                            Ir al inicio
                        </Button>
                    </Link>
                </div>

                <p className="mt-12 text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
                    ID de error: {error.digest || "Desconocido"}
                </p>
            </div>
        </div>
    );
}
