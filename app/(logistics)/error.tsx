"use client";

import { useEffect } from "react";
import { Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OperatorError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Operator Context Error:", error);
    }, [error]);

    return (
        <div className="h-full flex items-center justify-center p-12 bg-bone/30 rounded-[32px] border-2 border-dashed border-line m-6">
            <div className="max-w-[400px] text-center">
                <div className="w-16 h-16 bg-cream text-cocoa rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Truck size={32} />
                </div>

                <h2 className="text-2xl font-bold text-ink mb-3">
                    Error en la consola operativa
                </h2>
                <p className="text-ink-3 text-sm mb-8 leading-relaxed">
                    Hubo un problema al cargar los datos logísticos de esta sección. 
                    Por favor, intenta refrescar el panel o contacta a soporte técnico.
                </p>

                <Button onClick={() => reset()} className="gap-2">
                    <RotateCcw size={16} />
                    Refrescar sección
                </Button>
                
                {process.env.NODE_ENV === "development" && (
                    <div className="mt-8 p-4 bg-zinc-100 rounded-lg text-left overflow-auto max-h-40">
                        <p className="text-[10px] font-mono text-red-600 leading-tight">
                            {error.message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
