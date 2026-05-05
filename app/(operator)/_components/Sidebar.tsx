// app/(operator)/_components/OperatorSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Truck, ArrowLeft } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { OPERATOR_NAV } from "../../../config/operator-nav";

export function OperatorSidebar() {
    const pathname = usePathname();
    const { user } = useUser();

    return (
        <aside className="hidden lgx:flex lgx:flex-col lgx:fixed lgx:left-0 lgx:top-0 lgx:bottom-0 lgx:z-[60] w-[240px] bg-paper border-r border-line px-3.5 py-5 shrink-0 sticky top-0 h-screen">
            <div className="px-1.5 pb-5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-clay text-paper flex items-center justify-center">
                    <Truck size={16} />
                </div>
                <div>
                    <div className="text-sm font-semibold text-ink-3">UniHousing</div>
                    <div className="text-[10.5px] text-ink-3 font-mono">Shipping</div>
                </div>
            </div>

            <nav className="flex flex-col gap-0.5 flex-1">
                {OPERATOR_NAV.map((it) => {
                    const isActive = pathname.startsWith(it.route);
                    const Icon = it.icon;

                    return (
                        <Link
                            key={it.id}
                            href={it.route}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${isActive ? "bg-bone text-cocoa font-semibold" : "bg-transparent text-ink-2 font-medium hover:bg-bone/50"
                                }`}
                        >
                            <Icon size={18} />
                            {it.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto p-3 bg-bone rounded-r2">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="min-w-0">
                        <div className="text-[13px] font-semibold truncate text-ink-3">
                            {user?.firstName || "Operador"}
                        </div>
                        <div className="text-[11px] text-ink-3">Repartidor · Activo</div>
                    </div>
                </div>
                <Link href="/" className="text-[11px] text-ink-3 flex items-center gap-1 hover:text-ink">
                    <ArrowLeft size={11} /> Volver al hub
                </Link>
            </div>
        </aside>
    );
}