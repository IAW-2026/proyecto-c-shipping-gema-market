"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { loginSchema, LoginFormData } from "../../../lib/validations/auth";

import { Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginForm({ onToggleMode, onToggleResetPassword }: { onToggleMode?: () => void, onToggleResetPassword?: () => void }) {
    const { fetchStatus, signIn } = useSignIn();
    const router = useRouter();

    const [formData, setFormData] = useState<LoginFormData>({ identifier: "", password: "" });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validación Server-Side equivalente (Zod) ejecutada en el cliente antes de la red
        const validation = loginSchema.safeParse(formData);

        if (!validation.success) {
            setError(validation.error.issues[0].message);
            setIsLoading(false);
            return;
        }

        if (fetchStatus === "fetching") return;

        try {
            const result = await signIn.create({
                identifier: validation.data.identifier,
                password: validation.data.password,
            });

            if (result.error) {
                setError(result.error.message);
                setIsLoading(false);
                return;
            }

            if (signIn.status === "complete") {
                await signIn.finalize();
                router.push("/dashboard"); // Redirección al panel
            } else {
                // Manejo de flujos secundarios (ej. 2FA)
                setError("Se requiere verificación adicional.");
            }
        } catch (err: any) {
            setError(err.message || "Credenciales inválidas. Verifica tu usuario y contraseña.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {error && (
                <div className="p-3 bg-[#f0d9d1] text-[#9a3a1f] text-xs rounded-lg font-medium border border-[#9a3a1f]/20">
                    {error}
                </div>
            )}

            <label className="block">
                <span className="text-[13px] text-[#3a3c33] font-medium mb-1.5 block">Dirección de email</span>
                <div className="flex items-center gap-2 w-full bg-[#faf8f3] border border-[#d4ccb6] rounded-[14px] px-3.5 h-[46px] focus-within:border-[#414833] transition-colors">
                    <input
                        type="text"
                        placeholder="usuario@dominio.com"
                        className="flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-[#1c1d18] h-full"
                        value={formData.identifier}
                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                        disabled={isLoading}
                    />
                </div>
            </label>

            <label className="block">
                <span className="text-[13px] text-[#3a3c33] font-medium mb-1.5 block">Contraseña</span>
                <div className="flex items-center gap-2 w-full bg-[#faf8f3] border border-[#d4ccb6] rounded-[14px] px-3.5 h-[46px] focus-within:border-[#414833] transition-colors">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-[#1c1d18] h-full"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isLoading}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#6b6e60] hover:text-[#1c1d18]">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </label>

            <div className="flex justify-between text-xs -mt-1 mb-2">
                <button type="button" onClick={onToggleResetPassword} className="text-[#6b6e60] hover:text-[#1c1d18] transition-colors">Recuperar contraseña</button>

            </div>


            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] mt-2 inline-flex items-center justify-center rounded-full font-medium tracking-[-0.01em] bg-[#936639] text-[#faf8f3] hover:bg-[#7f4f24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validando...
                    </span>
                ) : "Ingresar"}
            </button>

            {onToggleMode && (
                <div className="text-center text-[13px] text-[#6b6e60] mt-4">
                    ¿No tienes cuenta?{" "}
                    <button type="button" onClick={onToggleMode} className="text-[#936639] font-medium hover:underline">
                        Crear cuenta
                    </button>
                </div>
            )}
        </form>
    );
}