import { PackageSearch } from "lucide-react";
import Link from "next/link";

export function CourierEmpty() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-4">
                <PackageSearch size={28} className="text-ink-2" />
            </div>
            <h2 className="text-lg font-bold text-ink mb-1">Sin misiones activas</h2>
            <p className="text-sm text-ink-2 mb-6 max-w-xs">
                No tenés envíos asignados. Andá a la sección &quot;Por tomar&quot; para aceptar uno.
            </p>
            <Link
                href="/available"
                className="bg-clay text-paper h-11 px-6 rounded-full text-sm font-bold hover:bg-cocoa transition-all inline-flex items-center gap-2"
            >
                Ver envíos disponibles
            </Link>
        </div>
    );
}
