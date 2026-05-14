import { ChevronDown } from "lucide-react";
import type { ShipmentSummary } from "@/lib/definitions/shipment";

interface ShipmentSelectorProps {
    shipments: ShipmentSummary[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

export function ShipmentSelector({ shipments, selectedIndex, onSelect }: ShipmentSelectorProps) {
    const current = shipments[selectedIndex];

    return (
        <div className="relative">
            <select
                value={selectedIndex}
                onChange={(e) => onSelect(Number(e.target.value))}
                className="appearance-none bg-paper border border-line rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-clay/30 min-w-[200px]"
            >
                {shipments.map((s, i) => (
                    <option key={s.shippingId} value={i}>
                        {s.trackingCode}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none"
            />
        </div>
    );
}
