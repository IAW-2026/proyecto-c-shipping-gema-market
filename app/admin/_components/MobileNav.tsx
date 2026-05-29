"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { ADMIN_NAV } from "@/lib/config/admin-nav";

export function AdminMobileNav() {
    const pathname = usePathname();
    const { isLoaded } = useUser();

    return (
        <nav className="flex lgx:hidden fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-[12px] border-t border-line justify-around px-1 pt-2 pb-3 z-40">
            {ADMIN_NAV.map((it) => {
                const isActive = pathname.startsWith(it.route);
                const Icon = it.icon;

                return (
                    <Link
                        key={it.id}
                        href={it.route}
                        className={`flex flex-col items-center gap-[3px] px-1 py-1.5 rounded-[10px] relative flex-1 min-w-0 ${isActive ? "text-cocoa" : "text-ink-3"
                            }`}
                    >
                        <Icon size={18} />
                        <span className="text-[9px] font-medium max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {it.label}
                        </span>
                        {isActive && <div className="absolute top-0 w-3.5 h-0.5 bg-cocoa rounded-full" />}
                    </Link>
                );
            })}

            <div className="flex flex-col items-center gap-[3px] px-1 py-1.5 flex-1 min-w-0 text-ink-3">
                {isLoaded ? (
                    <UserButton />
                ) : (
                    <div className="w-7 h-7 animate-pulse bg-line/50 rounded-full" />
                )}
                <span className="text-[9px] font-medium">Perfil</span>
            </div>
        </nav>
    );
}
