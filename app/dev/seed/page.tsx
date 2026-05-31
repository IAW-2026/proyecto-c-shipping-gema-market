import { SeedButton } from "../_components/seed-button";
import { DbExplorer } from "../_components/db-explorer";

export default function SeedPage() {
    return (
        <div className="p-6">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-ink">Seed</h1>
                <p className="text-sm text-ink-2 mt-1">
                    Seedea la base de datos y explora el contenido de cada tabla.
                </p>
            </div>
            <div className="space-y-6">
                <SeedButton />
                <DbExplorer />
            </div>
        </div>
    );
}
