"use client";

import { ShieldCheck, Smartphone, KeyRound, Mail } from "lucide-react";
import { SecondFactorMethod } from "./types";

interface TwoFactorSelectMethodProps {
  availableMethods: SecondFactorMethod[];
  phoneCodeSafeIdentifier: string | null;
  error: string | null;
  onSelectMethod: (method: SecondFactorMethod) => void;
  onBack: () => void;
}

const methodConfig: Record<SecondFactorMethod, { icon: React.ReactNode; label: string; description?: string }> = {
  totp: {
    icon: <ShieldCheck size={22} />,
    label: "Aplicación de autenticación (TOTP)",
  },
  phone_code: {
    icon: <Smartphone size={22} />,
    label: "Código por SMS",
  },
  backup_code: {
    icon: <KeyRound size={22} />,
    label: "Código de respaldo",
  },
  email_code: {
    icon: <Mail size={22} />,
    label: "Código por correo electrónico",
  },
};

export function TwoFactorSelectMethod({
  availableMethods,
  phoneCodeSafeIdentifier,
  error,
  onSelectMethod,
  onBack,
}: TwoFactorSelectMethodProps) {
  return (
    <div className="flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-300">
      {error && (
        <div className="p-3 bg-[#f0d9d1] text-[#9a3a1f] text-xs rounded-lg font-medium border border-[#9a3a1f]/20 shadow-sm">
          {error}
        </div>
      )}

      <div className="text-center mb-1">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#f4ebd8] text-[#936639] mx-auto mb-3 shadow-sm border border-[#d4ccb6]">
          <ShieldCheck size={28} />
        </div>
        <h3 className="text-[17px] font-semibold text-[#1c1d18]">Verificación en dos pasos</h3>
        <p className="text-[13px] text-[#6b6e60] mt-1 leading-relaxed">
          Elegí un método de verificación para continuar.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 mt-1">
        {availableMethods.map((method) => {
          const config = methodConfig[method];
          return (
            <button
              key={method}
              type="button"
              onClick={() => onSelectMethod(method)}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-[14px] bg-[#faf8f3] border border-[#d4ccb6] hover:bg-[#f4ebd8] hover:border-[#b8a98a] transition-all text-left shadow-sm"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f4ebd8] text-[#936639] shrink-0 border border-[#d4ccb6]">
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-[#1c1d18]">
                  {config.label}
                </span>
                {method === "phone_code" && phoneCodeSafeIdentifier && (
                  <p className="text-[12px] text-[#6b6e60] mt-0.5">
                    Código SMS a {phoneCodeSafeIdentifier}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {availableMethods.length === 0 && (
        <p className="text-[13px] text-[#6b6e60] text-center py-4">
          No hay métodos de verificación disponibles para esta cuenta.
        </p>
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-center text-[13px] text-[#6b6e60] hover:text-[#1c1d18] transition-colors mt-1 underline-offset-4 hover:underline"
      >
        Volver al inicio de sesión
      </button>
    </div>
  );
}
