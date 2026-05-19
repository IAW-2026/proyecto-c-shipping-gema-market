import { Truck } from "lucide-react";
import { AuthContainer } from "../_components/AuthContainer";

export const metadata = {
    title: "Login | Logística UniHousing",
    description: "Ingresa a tu cuenta de operador logístico.",
};

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#936639] to-[#582f0e] flex items-center justify-center p-6">
            <div className="bg-[#faf8f3] rounded-[28px] p-10 max-w-[420px] w-full shadow-[0_12px_32px_rgba(40,30,15,.08),0_24px_48px_rgba(40,30,15,.06)]">

                <div className="w-14 h-14 rounded-2xl bg-[#936639] text-[#faf8f3] flex items-center justify-center mb-5">
                    <Truck size={26} />
                </div>

                <h1 className="m-0 mb-1.5 text-[26px] tracking-[-0.02em] font-semibold text-[#1c1d18]">
                    Logística UniHousing
                </h1>
                <p className="m-0 mb-7 text-[#6b6e60] text-sm">
                    Ingresá con tu cuenta de operador o regístrate.
                </p>

                {/* Inyección del Client Component */}
                <AuthContainer />

            </div>
        </div>
    );
}