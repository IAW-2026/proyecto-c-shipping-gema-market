// components/ui/badge.tsx
import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral';
}

export function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
    const baseStyles = "px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider inline-flex items-center justify-center border";

    const variantStyles = {
        default: "bg-gray-100 text-gray-800 border-gray-200",
        success: "bg-green-100 text-green-800 border-green-200",
        warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
        danger: "bg-red-100 text-red-800 border-red-200",
        neutral: "bg-zinc-100 text-zinc-600 border-zinc-200",
    };

    return (
        <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
            {children}
        </div>
    );
}