import { Suspense } from "react";
import { TopBar } from "@/app/components/ui";
import { getAccountData } from "@/app/lib/helpers/account";
import AccountForm from "../components/features/account/AccountForm";
import AccountSkeleton from "../components/features/account/AccountSkeleton";

async function AccountContent() {
  const datos = await getAccountData();

  if (!datos) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <p className="text-ink-3">
          No se pudo cargar la información de la cuenta.
        </p>
      </div>
    );
  }

  return <AccountForm initialData={datos} />;
}

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-cream pb-47 lgx:pt-8 lgx:px-7 lgx:pb-32">
      <div className="lgx:hidden">
        <TopBar title="Cuenta" />
      </div>

      <Suspense fallback={<AccountSkeleton />}>
        <AccountContent />
      </Suspense>
    </div>
  );
}
