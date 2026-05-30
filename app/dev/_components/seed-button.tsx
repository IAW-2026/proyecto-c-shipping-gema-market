"use client";

import { useState } from "react";
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type SeedState = "idle" | "loading" | "success" | "error";

export function SeedButton() {
    const [state, setState] = useState<SeedState>("idle");
    const [message, setMessage] = useState("");
    const [lastSeed, setLastSeed] = useState<string | null>(null);

    const handleSeed = async () => {
        setState("loading");
        setMessage("");

        try {
            const res = await fetch("/api/dev/seed", { method: "POST" });
            const data = await res.json();

            if (res.ok) {
                setState("success");
                setMessage(data.message || "Seed completado correctamente");
                setLastSeed(new Date().toLocaleString("es-AR"));
            } else {
                setState("error");
                setMessage(data.error || "Error al seedear la base de datos");
            }
        } catch {
            setState("error");
            setMessage("Error de conexion. Verifica que el servidor este corriendo.");
        }
    };

    if (state === "idle") {
        return (
            <div className="bg-paper border border-line rounded-r3 overflow-hidden">
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-ink">Seed de Base de Datos</h3>
                        <p className="text-xs text-ink-3 mt-1">
                            Crea envios con fechas relativas al momento de ejecucion. No elimina usuarios existentes.
                        </p>
                    </div>
                    <button
                        onClick={handleSeed}
                        className="flex items-center gap-2 bg-clay text-paper hover:bg-cocoa rounded-xl px-5 py-2.5 text-sm font-semibold transition-all shrink-0"
                    >
                        <Database size={16} />
                        Seedear Base de Datos
                    </button>
                </div>
            </div>
        );
    }

    if (state === "loading") {
        return (
            <div className="bg-paper border border-line rounded-r3 overflow-hidden">
                <div className="p-6 flex items-center gap-3">
                    <Loader2 size={20} className="text-clay animate-spin" />
                    <div>
                        <h3 className="text-sm font-semibold text-ink">Seedando base de datos...</h3>
                        <p className="text-xs text-ink-3 mt-0.5">Esto puede tardar unos segundos.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (state === "success") {
        return (
            <div className="bg-paper border border-success/30 rounded-r3 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3">
                            <CheckCircle size={20} className="text-success shrink-0 mt-0.5 sm:mt-0" />
                            <div>
                                <h3 className="text-sm font-semibold text-success">Seed completado</h3>
                                <p className="text-xs text-ink-3 mt-0.5">{message}</p>
                                {lastSeed && (
                                    <p className="text-[11px] text-ink-3 font-mono mt-1">Ultimo seed: {lastSeed}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleSeed}
                            className="flex items-center gap-2 bg-clay text-paper hover:bg-cocoa rounded-xl px-4 py-2 text-xs font-semibold transition-all shrink-0"
                        >
                            <Database size={14} />
                            Re-seedear
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-paper border border-danger/30 rounded-r3 overflow-hidden">
            <div className="p-6">
                <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                        <AlertCircle size={20} className="text-danger shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                            <h3 className="text-sm font-semibold text-danger">Error al seedear</h3>
                            <p className="text-xs text-ink-3 mt-0.5">{message}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSeed}
                        className="flex items-center gap-2 bg-clay text-paper hover:bg-cocoa rounded-xl px-4 py-2 text-xs font-semibold transition-all shrink-0"
                    >
                        <Database size={14} />
                        Reintentar
                    </button>
                </div>
            </div>
        </div>
    );
}
