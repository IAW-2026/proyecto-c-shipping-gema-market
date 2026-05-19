"use client";

import { KeyRound, Loader2, ArrowLeft } from "lucide-react";

interface TwoFactorBackupCodeProps {
  code: string;
  error: string | null;
  isLoading: boolean;
  onCodeChange: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function TwoFactorBackupCode({
  code,
  error,
  isLoading,
  onCodeChange,
  onSubmit,
  onBack,
}: TwoFactorBackupCodeProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {error && (
        <div className="p-3 bg-[#f0d9d1] text-[#9a3a1f] text-xs rounded-lg font-medium border border-[#9a3a1f]/20 shadow-sm">
          {error}
        </div>
      )}

      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f4ebd8] text-[#936639] mb-3 shadow-sm border border-[#d4ccb6]">
          <KeyRound size={22} />
        </div>
        <h3 className="text-[17px] font-semibold text-[#1c1d18]">Código de respaldo</h3>
        <p className="text-[13px] text-[#6b6e60] mt-1 leading-relaxed">
          Ingresá uno de tus códigos de respaldo para acceder a tu cuenta.
        </p>
      </div>

      <label className="block mt-2">
        <span className="text-[13px] text-[#3a3c33] font-medium mb-1.5 block text-center">Código de respaldo</span>
        <div className="flex items-center gap-2 w-full bg-[#faf8f3] border border-[#d4ccb6] rounded-[14px] px-3.5 h-[52px] focus-within:border-[#414833] focus-within:ring-1 focus-within:ring-[#414833] transition-all shadow-sm">
          <input
            type="text"
            placeholder="xxxxx-xxxxx"
            className="flex-1 min-w-0 border-0 outline-none bg-transparent text-base text-[#1c1d18] h-full font-mono text-center"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
        </div>
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-[52px] mt-3 inline-flex items-center justify-center rounded-full font-medium tracking-[-0.01em] bg-[#936639] text-[#faf8f3] hover:bg-[#7f4f24] hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verificando...
          </span>
        ) : "Verificar código"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center gap-1.5 text-[13px] text-[#6b6e60] hover:text-[#1c1d18] transition-colors underline-offset-4 hover:underline mt-2"
      >
        <ArrowLeft size={14} />
        Otro método
      </button>
    </form>
  );
}
