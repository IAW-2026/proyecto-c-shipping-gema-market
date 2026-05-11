import { cn } from "@/lib/shared/utils";

interface MetricCardProps {
    title: string;
    value: string | number;
    className?: string;
}

export function MetricCard({ title, value, className }: MetricCardProps) {
    return (
        <div className={cn(
            "bg-paper p-5 rounded-[26px] border border-ink flex flex-col justify-center",
            className
        )}>
            <span className="font-sans text-sm text-ink-3 uppercase font-bold tracking-wider">
                {title}
            </span>
            <span className="mt-1 text-[30px] text-ink font-sans font-bold tracking-tight">
                {value}
            </span>
        </div>
    );
}
