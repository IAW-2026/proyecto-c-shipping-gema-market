"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { resetPasswordInitSchema, verifyCodeSchema, resetPasswordSchema } from "../../../lib/validations/auth";
import { Eye, EyeOff } from "lucide-react";

export function ResetPasswordForm({ onCancel }: { onCancel: () => void }) {
    const { fetchStatus, signIn } = useSignIn();
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [passwords, setPasswords] = useState({ password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFetching = fetchStatus === "fetching";

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signIn || isFetching) return;
        setError(null);

        const validation = resetPasswordInitSchema.safeParse({ email });
        if (!validation.success) {
            setError(validation.error.issues[0].message);
            return;
        }

        try {
            // Iniciamos el flujo de sign in para ese email
            await signIn.create({ identifier: validation.data.email });

            // Solicitamos el código para restaurar la contraseña
            const sendRes = await signIn.resetPasswordEmailCode.sendCode();
            if (sendRes.error) {
                setError(sendRes.error.message);
                return;
            }

            setStep(1);
        } catch (err: any) {
            setError(err.message || "Error al solicitar el código de recuperación.");
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signIn || isFetching) return;
        setError(null);

        const validation = verifyCodeSchema.safeParse({ code });
        if (!validation.success) {
            setError(validation.error.issues[0].message);
            return;
        }

        try {
            const res = await signIn.resetPasswordEmailCode.verifyCode({
                code: validation.data.code
            });
            if (res.error) {
                setError(res.error.message);
                return;
            }
            setStep(2);
        } catch (err: any) {
            setError(err.message || "Código inválido o expirado.");
        }
    };

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signIn || isFetching) return;
        setError(null);

        const validation = resetPasswordSchema.safeParse(passwords);
        if (!validation.success) {
            setError(validation.error.issues[0].message);
            return;
        }

        try {
            const res = await signIn.resetPasswordEmailCode.submitPassword({
                password: validation.data.password
            });
            if (res.error) {
                setError(res.error.message);
                return;
            }

            if (signIn.status === "complete") {
                await signIn.finalize();
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message || "Error al cambiar la contraseña.");
        }
    };

    return (
        <div>
            {error && (
                <div className="p-3 mb-4 bg-[#f0d9d1] text-[#9a3a1f] text-xs rounded-lg font-medium border border-[#9a3a1f]/20">
                    {error}
                </div>
            )}

            {step === 0 && (
                <form onSubmit={handleSendCode} className="flex flex-col gap-3.5">
                    <p className="text-sm text-[#3a3c33] mb-2">Ingresa tu correo para recuperar tu contraseña.</p>
                    <label className="block">
                        <span className="text-[13px] text-[#3a3c33] font-medium mb-1.5 block">Correo Institucional / Personal</span>
                        <div className="flex items-center gap-2 w-full bg-[#faf8f3] border border-[#d4ccb6] rounded-[14px] px-3.5 h-[46px] focus-within:border-[#414833] transition-colors">
                            <input
                                type="email"
                                placeholder="juan@unihousing.com"
                                className="flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-[#1c1d18] h-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isFetching}
                            />
                        </div>
                    </label>
                    <button
                        type="submit"
                        disabled={isFetching}
                        className="w-full h-[52px] mt-2 inline-flex items-center justify-center rounded-full font-medium tracking-[-0.01em] bg-[#936639] text-[#faf8f3] hover:bg-[#7f4f24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isFetching ? "Enviando..." : "Enviar código"}
                    </button>
                    <button type="button" onClick={onCancel} className="text-sm text-[#6b6e60] hover:text-[#1c1d18] mt-2">
                        Volver al inicio de sesión
                    </button>
                </form>
            )}

            {step === 1 && (
                <form onSubmit={handleVerifyCode} className="flex flex-col gap-3.5">
                    <p className="text-sm text-[#3a3c33] mb-2">Ingresa el código de 6 dígitos enviado a tu correo.</p>
                    <label className="block">
                        <span className="text-[13px] text-[#3a3c33] font-medium mb-1.5 block">Código de Verificación</span>
                        <div className="flex items-center gap-2 w-full bg-[#faf8f3] border border-[#d4ccb6] rounded-[14px] px-3.5 h-[46px] focus-within:border-[#414833] transition-colors">
                            <input
                                type="text"
                                maxLength={6}
                                className="flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-[#1c1d18] h-full font-mono tracking-widest"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                disabled={isFetching}
                            />
                        </div>
                    </label>
                    <button
                        type="submit"
                        disabled={isFetching}
                        className="w-full h-[52px] mt-2 inline-flex items-center justify-center rounded-full font-medium tracking-[-0.01em] bg-[#936639] text-[#faf8f3] hover:bg-[#7f4f24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isFetching ? "Verificando..." : "Verificar código"}
                    </button>
                    <button type="button" onClick={onCancel} className="text-sm text-[#6b6e60] hover:text-[#1c1d18] mt-2">
                        Cancelar
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleSubmitPassword} className="flex flex-col gap-3.5">
                    <p className="text-sm text-[#3a3c33] mb-2">Crea una nueva contraseña.</p>
                    <label className="block">
                        <span className="text-[13px] text-[#3a3c33] font-medium mb-1.5 block">Nueva contraseña</span>
                        <div className="flex items-center gap-2 w-full bg-[#faf8f3] border border-[#d4ccb6] rounded-[14px] px-3.5 h-[46px] focus-within:border-[#414833] transition-colors">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-[#1c1d18] h-full"
                                value={passwords.password}
                                onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                                disabled={isFetching}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#6b6e60] hover:text-[#1c1d18]">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </label>

                    <label className="block">
                        <span className="text-[13px] text-[#3a3c33] font-medium mb-1.5 block">Confirmar contraseña</span>
                        <div className="flex items-center gap-2 w-full bg-[#faf8f3] border border-[#d4ccb6] rounded-[14px] px-3.5 h-[46px] focus-within:border-[#414833] transition-colors">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-[#1c1d18] h-full"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                disabled={isFetching}
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-[#6b6e60] hover:text-[#1c1d18]">
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </label>

                    <button
                        type="submit"
                        disabled={isFetching}
                        className="w-full h-[52px] mt-2 inline-flex items-center justify-center rounded-full font-medium tracking-[-0.01em] bg-[#936639] text-[#faf8f3] hover:bg-[#7f4f24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isFetching ? "Actualizando..." : "Cambiar contraseña"}
                    </button>
                </form>
            )}
        </div>
    );
}
