import { Weight, MapPin, Clock } from "lucide-react";
import { InfoTag } from "@/components/ui/info-tag";

export function WeightTag({ value }: { value: string }) {
    return <InfoTag label={value} Icon={Weight} />;
}

export function DistanceTag({ value }: { value: string }) {
    return <InfoTag label={value} Icon={MapPin} />;
}

export function TimeTag({ value }: { value: string }) {
    return <InfoTag label={value} Icon={Clock} />;
}