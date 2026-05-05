import { ReactNode } from "react";
import { cn } from "@/lib/shared/utils";

// 1. Contenedor Base (Asegura que ocupe el alto disponible)
export function PageWrapper({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("flex flex-col min-h-[calc(100vh-64px)]", className)}>
            {children}
        </div>
    );
}

// 2. Encabezado Genérico (Mantiene el contrato visual estricto)
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
                        <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-ink-3 mb-1">
                            {subtitle}
                        </div>
                    )}
                    <h1 className="m-0 text-[26px] font-semibold tracking-[-0.02em] text-ink">
                        {title}
                    </h1>
                </div>

                {/* Acción en Desktop: Alineada a la derecha en el header */}
                {action && (
                    <div className="hidden lgx:flex items-center gap-3">
                        {action}
                    </div>
                )}
            </header>

            {/* Acción en Mobile: Fija (Sticky/Fixed) sobre el MobileNav */}
            {action && (
                <div className="lgx:hidden fixed bottom-[76px] left-0 right-0 z-40 pointer-events-none flex justify-center">
                    {/* Restauramos los pointer-events solo para el botón. 
                        Aplicamos selectores descendientes para forzar que el botón ocupe todo el ancho disponible y centre su contenido. */}
                    <div className="pointer-events-auto w-full flex [&>*]:flex-1 [&>*]:justify-center [&>*]:shadow-lg">
                        {action}
                    </div>
                </div>
            )}
        </>
    );
}

// 3. Contenedor de Contenido (Lienzo en blanco)
export function Content({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <main className={cn("flex-1", className)}>
            {children}
        </main>
    );
}