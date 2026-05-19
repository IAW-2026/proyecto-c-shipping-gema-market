"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReceiptActions() {
    const handleExport = () => {
        console.log("Se descargo el recibo");
    };

    return (
        <div className="flex w-full gap-2">
            <Button variant="secondary" onClick={handleExport} className="flex-1 lgx:flex-none">
                <Download size={16} />
                Recibo
            </Button>
        </div>
    );
}
