"use client";

import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert } from "lucide-react";

export function UnauthorizedContent() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-cream p-4">
            <div className="bg-paper border border-line rounded-r3 p-8 max-w-md w-full text-center shadow-sm">
                <div className="flex justify-center mb-6 text-warn">
                    <ShieldAlert size={64} strokeWidth={1.5} />
                </div>

                <h1 className="text-2xl font-bold text-ink mb-2">
                    Acceso Denegado
                </h1>

                <p className="text-ink-2 mb-8 text-sm leading-relaxed">
                    Tu usuario no tiene los permisos necesarios para acceder a esta sección.
                </p>

                <SignOutButton redirectUrl="/sign-in">
                    <button
                        className="inline-flex items-center justify-center bg-[#936639] text-[#faf8f3] px-6 py-3 rounded-full text-sm font-medium hover:bg-[#7f4f24] transition-colors w-full cursor-pointer"
                    >
                        Cerrar sesión e ir a Login
                    </button>
                </SignOutButton>
            </div>
        </main>
    );
}
