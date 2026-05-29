import { cn } from "@/lib/utils/classnames";

export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={cn("animate-pulse rounded-md bg-ink/10", className)} />
    );
}
