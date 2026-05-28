import * as React from "react";
import { cn } from "@/lib/shared/classnames";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center gap-2 text-sm font-sans font-medium transition-all active:scale-[0.98] h-11 px-5 rounded-full",
                    variant === "primary"
                        ? "bg-clay text-paper hover:bg-cocoa"
                        : "bg-paper text-ink hover:bg-cream",
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";