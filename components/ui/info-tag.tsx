import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/classnames";

interface InfoTagProps {
    label: string;
    Icon: LucideIcon;
    className?: string;
}

export function InfoTag({ label, Icon, className }: InfoTagProps) {
    return (
        <div className={cn(
            "inline-flex items-center gap-2 border border-ink-3 bg-zinc-50 bg-paper",
            "px-3 py-1 rounded-[20px]", // Agregué 'px' al final de rounded-[20] que parecía ser un error en el original
            "font-sans font-semibold text-[12px] text-ink-2",
            className
        )}>
            <Icon size={12} strokeWidth={2.5} className="text-zinc-400" />
            <span>{label}</span>
        </div>
    );
}
