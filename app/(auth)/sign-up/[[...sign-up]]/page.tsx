import { ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { SignUp } from "@clerk/nextjs";
import { Truck } from "lucide-react";

export const metadata = {
    title: "Registro | Logística UniHousing",
    description: "Creá tu cuenta de operador logístico.",
};

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#936639] to-[#582f0e] flex flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center mb-3 text-center">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-clay text-paper flex items-center justify-center shrink-0 shadow-lg">
                        <Truck size={20} />
                    </div>
                    <div className="text-left">
                        <h1 className="text-paper text-lg font-semibold leading-tight">
                            Logística UniHousing
                        </h1>
                        <p className="text-paper/60 text-xs leading-tight">
                            Gestión inteligente de envíos
                        </p>
                    </div>
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-paper/15 text-paper text-xs font-medium">
                    Crear cuenta
                </span>
            </div>

            <ClerkLoading>
                <div className="bg-paper rounded-[28px] p-10 max-w-[420px] w-full shadow-[0_12px_32px_rgba(40,30,15,.08),0_24px_48px_rgba(40,30,15,.06)] animate-pulse space-y-4">
                    <div className="h-[46px] bg-line rounded-full" />
                    <div className="h-4 bg-line rounded w-1/3 mx-auto" />
                    <div className="h-[46px] bg-line rounded-[14px]" />
                    <div className="h-[46px] bg-line rounded-[14px]" />
                    <div className="h-[46px] bg-line rounded-[14px]" />
                    <div className="h-[52px] bg-line rounded-full" />
                </div>
            </ClerkLoading>

            <ClerkLoaded>
                <SignUp
                    signInUrl="/sign-in"
                    appearance={{
                        elements: {
                            card: "bg-paper rounded-[28px] p-10 max-w-[420px] w-full shadow-[0_12px_32px_rgba(40,30,15,.08),0_24px_48px_rgba(40,30,15,.06)]",
                            headerTitle: "hidden",
                            headerSubtitle: "hidden",
                            socialButtonsBlockButton:
                                "rounded-full border-line-2 text-ink-2 font-medium normal-case text-sm h-[46px]",
                            socialButtonsBlockButtonText: "text-ink-2 font-medium",
                            dividerLine: "bg-line",
                            dividerText: "text-ink-3 text-xs",
                            formFieldLabel: "text-ink-2 text-xs font-medium",
                            formFieldInput:
                                "bg-paper border-line-2 rounded-[14px] text-sm text-ink h-[46px] px-3.5 focus:border-olive focus:ring-1 focus:ring-olive",
                            formButtonPrimary:
                                "bg-clay hover:bg-cocoa rounded-full text-paper font-medium text-sm normal-case h-[52px] w-full",
                            footerActionText: "text-ink-3 text-xs",
                            footerActionLink: "text-clay hover:text-cocoa text-xs font-medium",
                            identityPreviewText: "text-ink-2 text-xs",
                            identityPreviewEditButton: "text-clay text-xs",
                        },
                    }}
                />
            </ClerkLoaded>
        </div>
    );
}
