"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

export function AuthContainer() {
    const [mode, setMode] = useState<"login" | "signup" | "reset">("login");

    let content;
    if (mode === "reset") {
        content = <ResetPasswordForm onCancel={() => setMode("login")} />;
    } else if (mode === "login") {
        content = <LoginForm onToggleMode={() => setMode("signup")} onToggleResetPassword={() => setMode("reset")} />;
    } else {
        content = <SignUpForm onToggleMode={() => setMode("login")} />;
    }

    return (
        <>
            {content}
            
            {/* CAPTCHA Widget Container for Clerk Bot Protection (Global for Auth) */}
            <div id="clerk-captcha" className="my-2 min-h-[1px]"></div>
        </>
    );
}
