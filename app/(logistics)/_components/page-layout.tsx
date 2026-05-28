import { ReactNode } from "react";
import { cn } from "@/lib/shared/classnames";

export function PageWrapper({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("flex flex-col flex-1", className)}>
            {children}
        </div>
    );
}

interface HeaderProps {
    title: ReactNode;
    subtitle?: string;
    action?: ReactNode;
    className?: string;
}

export function Header({ title, subtitle, action, className }: HeaderProps) {
    return (
        <>
            <header className={cn(
                "px-4 lgx:px-7 pt-8 pb-4 flex flex-wrap justify-between items-end gap-4 border-b border-line mb-6 bg-paper",
                className
            )}>
                <div>
                    {subtitle && (
                        <div className="text-xs font-mono uppercase tracking-[0.1em] text-ink-3 mb-1">
                            {subtitle}
                        </div>
                    )}
                    <h1 className="m-0 text-2xl font-sans font-bold tracking-[-0.02em] text-ink">
                        {title}
                    </h1>
                </div>

                {action && (
                    <div className="hidden lgx:flex items-center gap-3">
                        {action}
                    </div>
                )}
            </header>

            {action && (
                <div className="lgx:hidden fixed bottom-[76px] left-0 right-0 z-40 pointer-events-none flex justify-center">
                    <div className="pointer-events-auto w-full flex [&>*]:flex-1 [&>*]:justify-center [&>*]:shadow-lg">
                        {action}
                    </div>
                </div>
            )}
        </>
    );
}

export function Content({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <section className={cn("flex-1", className)}>
            {children}
        </section>
    );
}
