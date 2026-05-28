// components/ui/card.tsx
import { cn } from "@/lib/shared/classnames"; // Utilidad estándar para combinar clases

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className, padding = "md" }: CardProps) {
    const paddingStyles = {
        none: "p-0",
        sm: "p-3",
        md: "p-5",
        lg: "p-8",
    };

    return (
        <div className={cn(
            "bg-paper border border-line rounded-[22px] shadow-sm transition-all overflow-hidden",
            paddingStyles[padding],
            className
        )}>
            {children}
        </div>
    );
}