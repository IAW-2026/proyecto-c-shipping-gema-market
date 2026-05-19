"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { signUpSchema, SignUpFormData } from "../../../lib/validations/auth";
import { syncNewUserAction } from "@/lib/actions/auth.actions";

import { Eye, EyeOff, Loader2 } from "lucide-react";

export function SignUpForm({ onToggleMode }: { onToggleMode?: () => void }) {
    const { fetchStatus, signUp } = useSignUp();
    const router = useRouter();

    const [formData, setFormData] = useState<SignUpFormData>({ name: "", email: "", password: "" });
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const isFetching = fetchStatus === "fetching";

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signUp || isFetching) return;
        setError(null);

        const validation = signUpSchema.safeParse(formData);
        if (!validation.success) {
            setError(validation.error.issues[0].message);
            return;
        }

        try {
            const result = await signUp.create({
                firstName: validation.data.name.split(" ")[0] || validation.data.name,
                lastName: validation.data.name.split(" ").slice(1).join(" ") || "",
                emailAddress: validation.data.email,
                password: validation.data.password,
            });

            if (result.error) {
                setError(result.error.message);
                return;
            }

            if (signUp.status === "complete") {
                const createdUserId = signUp.createdUserId;
                if (!createdUserId) {
                    setError("Error al obtener el ID del usuario.");
                    return;
                }

                const syncResult = await syncNewUserAction(createdUserId);
                if (syncResult?.error) {
                    setError(syncResult.error);
                    return;
                }

                await signUp.finalize();

                router.push("/dashboard");
            } else {
                setError("Se requieren pasos adicionales. Intentá de nuevo.");
            }
        } catch (err: any) {
            setError(err.message || "Error al crear la cuenta.");
        }
    };

    return (
        <div>
            {error && (
                <div className="p-3 mb-4 bg-[#f0d9d1] text-[#9a3a1f] text-xs rounded-lg font-medium border border-[#9a3a1f]/20">
                    {error}
                </div>
            )}

            <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
                <label className="block">
                    <span className="text-[13px] text-[#3a3c33] font-medium mb-1.5 block">Nombre y apellido</span>
                    <div className="flex items-center gap-2 w-full bg-[#faf8f3] border border-[#d4ccb6] rounded-[14px] px-3.5 h-[46px] focus-within:border-[#414833] transition-colors">
                        <input
                            type="text"
                            placeholder="Juan Pérez"
                            className="flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-[#1c1d18] h-full"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={isFetching}
                        />
                    </div>
                </label>

                <label className="block">
                    <span className="text-[13px] text-[#3a3c33] font-medium mb-1.5 block">Correo Institucional / Personal</span>
                    <div className="flex items-center gap-2 w-full bg-[#faf8f3] border border-[#d4ccb6] rounded-[14px] px-3.5 h-[46px] focus-within:border-[#414833] transition-colors">
                        <input
                            type="email"
                            placeholder="juan@unihousing.com"
                            className="flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-[#1c1d18] h-full"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={isFetching}
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
                            disabled={isFetching}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#6b6e60] hover:text-[#1c1d18]">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </label>


                <button
                    type="submit"
                    disabled={isFetching}
                    className="w-full h-[52px] mt-2 inline-flex items-center justify-center rounded-full font-medium tracking-[-0.01em] bg-[#936639] text-[#faf8f3] hover:bg-[#7f4f24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isFetching ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando...
                        </span>
                    ) : "Crear cuenta"}
                </button>

                {onToggleMode && (
                    <div className="text-center text-[13px] text-[#6b6e60] mt-4">
                        ¿Ya tienes cuenta?{" "}
                        <button type="button" onClick={onToggleMode} className="text-[#936639] font-medium hover:underline">
                            Ingresar
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
