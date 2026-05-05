import { LucideIcon } from "lucide-react";
import { Weight, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface ShipmentInfoTagProps {
    label: string;
    Icon: LucideIcon;
    className?: string;
}

function ShipmentInfoTag({ label, Icon, className }: ShipmentInfoTagProps) {
    return (
        <div className={cn(
            "inline-flex items-center gap-2 border border-ink-3 bg-zinc-50 bg-paper",
            "px-3 py-1 rounded-[20]", // Padding uniforme solicitado
            "font-sans font-semibold text-[12px] text-ink-2", // Tamaño y color de fuente
            className
        )}>
            <Icon size={12} strokeWidth={2.5} className="text-zinc-400" />
            <span>{label}</span>
        </div>
    );
}


export function WeightTag({ value }: { value: string }) {
    return <ShipmentInfoTag label={value} Icon={Weight} />;
}

export function DistanceTag({ value }: { value: string }) {
    return <ShipmentInfoTag label={value} Icon={MapPin} />;
}

export function TimeTag({ value }: { value: string }) {
    return <ShipmentInfoTag label={value} Icon={Clock} />;
}