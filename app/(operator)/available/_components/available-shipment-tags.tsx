import { Weight, MapPin, Clock } from "lucide-react";
import { InfoTag } from "@/components/ui/info-tag";

export function WeightTag({ value }: { value: number | string }) {
    const displayValue = typeof value === 'number' ? `${value} kg` : value;
    return <InfoTag label={displayValue} Icon={Weight} />;
}

export function DistanceTag({ value }: { value: number | string | undefined }) {
    if (value === undefined) return null;
    const displayValue = typeof value === 'number' ? `${value} km` : value;
    return <InfoTag label={displayValue} Icon={MapPin} />;
}

export function TimeTag({ value }: { value: string }) {
    return <InfoTag label={value} Icon={Clock} />;
}