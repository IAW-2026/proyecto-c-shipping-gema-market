import { PackageSearch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OperatorNotFound() {
    return (
        <div className="h-full flex items-center justify-center p-12 bg-white rounded-[32px] border border-line m-6 shadow-sm">
            <div className="max-w-[420px] text-center">
                <div className="w-16 h-16 bg-bone text-zinc-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <PackageSearch size={32} />
                </div>

                <h2 className="text-2xl font-bold text-ink mb-3">
                    Recurso no encontrado
                </h2>
                <p className="text-ink-3 text-sm mb-8 leading-relaxed">
                    No pudimos encontrar la información logística solicitada (Envío, Orden o Liquidación). 
                    Es posible que el ID sea incorrecto o que haya sido eliminado.
                </p>

                <div className="flex flex-col gap-3">
                    <Link href="/dashboard">
                        <Button className="w-full gap-2">
                            Volver al Dashboard
                            <ArrowRight size={16} />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
