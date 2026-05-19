"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { LoginFormData } from "../../../../lib/validations/auth";

interface CredentialsStepProps {
  formData: LoginFormData;
  error: string | null;
  isLoading: boolean;
  showPassword: boolean;
  onFormDataChange: (data: LoginFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePassword: () => void;
  onToggleResetPassword?: () => void;
  onToggleMode?: () => void;
}

export function CredentialsStep({
  formData,
  error,
  isLoading,
  showPassword,
  onFormDataChange,
  onSubmit,
  onTogglePassword,
  onToggleResetPassword,
  onToggleMode,
}: CredentialsStepProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5 animate-in fade-in duration-300">
      {error && (
        <div className="p-3 bg-[#f0d9d1] text-[#9a3a1f] text-xs rounded-lg font-medium border border-[#9a3a1f]/20 shadow-sm">
          {error}
        </div>
      )}

      <label className="block">
        <span className="text-[13px] text-[#3a3c33] font-medium mb-1.5 block">Dirección de email</span>
        <div className="flex items-center gap-2 w-full bg-[#faf8f3] border border-[#d4ccb6] rounded-[14px] px-3.5 h-[46px] focus-within:border-[#414833] focus-within:ring-1 focus-within:ring-[#414833] transition-all shadow-sm">
          <input
            type="text"
            placeholder="usuario@dominio.com"
            className="flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-[#1c1d18] h-full"
            value={formData.identifier}
            onChange={(e) => onFormDataChange({ ...formData, identifier: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </label>

      <label className="block">
        <span className="text-[13px] text-[#3a3c33] font-medium mb-1.5 block">Contraseña</span>
        <div className="flex items-center gap-2 w-full bg-[#faf8f3] border border-[#d4ccb6] rounded-[14px] px-3.5 h-[46px] focus-within:border-[#414833] focus-within:ring-1 focus-within:ring-[#414833] transition-all shadow-sm">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-[#1c1d18] h-full"
            value={formData.password}
            onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
            disabled={isLoading}
          />
          <button type="button" onClick={onTogglePassword} className="text-[#6b6e60] hover:text-[#1c1d18] transition-colors">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>

      <div className="flex justify-between text-xs -mt-1 mb-2">
        <button type="button" onClick={onToggleResetPassword} className="text-[#6b6e60] hover:text-[#1c1d18] transition-colors underline-offset-4 hover:underline">
          Recuperar contraseña
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-[52px] mt-2 inline-flex items-center justify-center rounded-full font-medium tracking-[-0.01em] bg-[#936639] text-[#faf8f3] hover:bg-[#7f4f24] hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
          <button type="button" onClick={onToggleMode} className="text-[#936639] font-medium underline-offset-4 hover:underline">
            Crear cuenta
          </button>
        </div>
      )}
    </form>
  );
}
