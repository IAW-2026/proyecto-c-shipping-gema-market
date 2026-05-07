import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalNotFound() {
    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6 font-sans">
            <div className="max-w-[480px] w-full text-center">
                <div className="relative inline-block mb-8">
                    <div className="w-24 h-24 bg-bone rounded-full flex items-center justify-center animate-pulse">
                        <Search size={44} className="text-zinc-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-clay text-paper px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        404
                    </div>
                </div>

                <h1 className="text-[32px] font-bold text-ink tracking-tight mb-4">
                    Página no encontrada
                </h1>
                <p className="text-ink-3 text-base mb-10 leading-relaxed">
                    No pudimos encontrar la ruta que estás buscando. Es posible que la dirección haya cambiado o que el recurso ya no esté disponible.
                </p>

                <div className="flex justify-center">
                    <Link href="/">
                        <Button className="gap-2 px-8">
                            <ArrowLeft size={18} />
                            Volver al panel principal
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
