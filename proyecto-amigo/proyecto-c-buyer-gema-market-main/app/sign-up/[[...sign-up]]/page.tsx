"use client";
import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/app/components/ui";

export default function SignUpPage() {
  return (
    <div className="min-h-[100dvh] bg-cream flex flex-col items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={40} color="#414833" />
          </div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Creá tu cuenta
          </h1>
        </div>

        <div className="w-full flex justify-center items-center">
          <Suspense fallback={<div className="w-full h-[400px] animate-pulse rounded-r2 bg-bone" />}>
            <SignUp
              fallbackRedirectUrl="/"
              signInFallbackRedirectUrl="/"
              signInUrl="/sign-in"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-none p-0",
                  header: "hidden",
                  formButtonPrimary:
                    "bg-moss hover:bg-forest text-paper transition-colors",
                  footer: "bg-transparent",
                  socialButtonsBlockButton:
                    "border-line hover:bg-bone transition-colors",
                  formFieldInput: "border-line focus:border-moss focus:ring-moss",
                },
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
