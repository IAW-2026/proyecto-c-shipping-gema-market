"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

export function AuthContainer() {
    const [mode, setMode] = useState<"login" | "signup" | "reset">("login");

    if (mode === "reset") {
        return <ResetPasswordForm onCancel={() => setMode("login")} />;
    }

    return mode === "login" ? (
        <LoginForm onToggleMode={() => setMode("signup")} onToggleResetPassword={() => setMode("reset")} />
    ) : (
        <SignUpForm onToggleMode={() => setMode("login")} />
    );
}
