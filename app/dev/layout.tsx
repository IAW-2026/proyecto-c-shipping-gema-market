import { ReactNode, Suspense } from "react";
import { DevSidebar } from "./_components/DevSidebar";
import { MobileNav } from "./_components/MobileNav";

export default function DevLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-cream">
            <Suspense fallback={<aside className="hidden lgx:flex lgx:flex-col lgx:fixed lgx:left-0 lgx:top-0 lgx:bottom-0 lgx:z-[60] w-[240px] bg-paper border-r border-line" />}>
                <DevSidebar />
            </Suspense>

            <main className="flex-1 min-w-0 flex flex-col lgx:ml-[240px] lgx:w-[calc(100%-240px)] pb-[72px] lgx:pb-0">
                {children}
            </main>

            <Suspense fallback={<nav className="flex lgx:hidden fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-[12px] border-t border-line justify-around px-1 pt-2 pb-3 z-40 h-[72px]" />}>
                <MobileNav />
            </Suspense>
        </div>
    );
}
