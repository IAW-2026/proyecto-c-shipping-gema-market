"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { ShipmentSummary } from "@/lib/schemas/domain";

interface ShipmentSelectorProps {
    shipments: ShipmentSummary[];
    selectedTracking: string;
}

export function ShipmentSelector({ shipments, selectedTracking }: ShipmentSelectorProps) {
    const router = useRouter();

    return (
        <div className="relative">
            <select
                value={selectedTracking}
                onChange={(e) => router.push(`/courier?tracking=${e.target.value}`)}
                className="appearance-none bg-paper border border-line rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-clay/30 min-w-[200px]"
            >
                {shipments.map((s) => (
                    <option key={s.shippingId} value={s.trackingCode}>
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
