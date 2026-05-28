import { cn } from "@/lib/shared/classnames";

interface MetricCardProps {
    title: string;
    value: string | number;
    className?: string;
    icon?: React.ReactNode;
}

export function MetricCard({ title, value, className, icon }: MetricCardProps) {
    return (
        <div className={cn(
            "bg-paper p-5 rounded-[26px] border border-ink flex items-center gap-4",
            className
        )}>
            {icon}
            <div className="flex flex-col justify-center">
                <span className="font-sans text-sm text-ink-3 uppercase font-bold tracking-wider">
                    {title}
                </span>
                <span className="mt-1 text-[30px] text-ink font-sans font-bold tracking-tight">
                    {value}
                </span>
            </div>
        </div>
    );
}
