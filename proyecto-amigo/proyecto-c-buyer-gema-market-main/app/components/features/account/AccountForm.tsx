"use client";

import { useActionState, useState, useEffect } from "react";
import { Card, Avatar, Field, Input, Button, Icon } from "@/app/components/ui";
import { SignOutButton } from "@clerk/nextjs";
import type { Usuario } from "@prisma/client";
import type { Address } from "@/app/lib/types/user";
import { updateAccountAction } from "../../../lib/actions/account";

interface AccountFormProps {
  initialData: Usuario;
}

export default function AccountForm({ initialData }: AccountFormProps) {
  const initialAddress = (initialData.address as unknown as Address) || {
    street: "",
    number: "",
    zip: "",
  };

  const [state, formAction, isPending] = useActionState(
    updateAccountAction,
    null,
  );

  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!state) return;
    const showTimer = setTimeout(() => setShowBanner(true), 0);
    const hideTimer = setTimeout(() => setShowBanner(false), 3500);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [state]);

  return (
    <div className="p-4 min-[600px]:max-w-[760px] min-[600px]:mx-auto min-[600px]:p-6 lgx:max-w-[760px] lgx:mx-auto lgx:p-0">
      <Card padding={20} className="mb-4">
        <div className="flex items-center gap-3.5">
          <Avatar name={initialData.fullName} size={64} />
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold">{initialData.fullName}</div>
            <div className="text-[13px] text-ink-3 [overflow-wrap:anywhere]">
              {initialData.email}
            </div>
          </div>
        </div>
      </Card>

      <form action={formAction}>
        <Card padding={20}>
          <div className="flex items-center gap-2.5 mb-[18px]">
            <div className="w-9 h-9 rounded-xl bg-bone flex items-center justify-center text-olive">
              <Icon name="user" size={18} />
            </div>
            <div>
              <h2 className="m-0 text-[17px] font-bold">
                Información de perfil
              </h2>
              <div className="text-xs text-ink-3">
                Estos datos se usan para tus compras y entregas.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 min-[600px]:grid-cols-2 lgx:grid-cols-2 lgx:gap-4">
            <Field label="Nombre completo">
              <Input
                name="fullName"
                icon="user"
                defaultValue={initialData.fullName ?? ""}
              />
            </Field>
            <Field label="Email">
              <Input
                name="email"
                icon="mail"
                type="email"
                defaultValue={initialData.email ?? ""}
              />
            </Field>
            <Field label="Teléfono">
              <Input
                name="phoneNumber"
                icon="phone"
                defaultValue={initialData.phoneNumber ?? ""}
              />
            </Field>
            <Field label="Dirección">
              <Input
                name="street"
                icon="pin"
                defaultValue={initialAddress.street}
              />
            </Field>
            <Field label="Número">
              <Input
                name="number"
                defaultValue={initialAddress.number}
              />
            </Field>
            <Field label="Código postal">
              <Input
                name="zip"
                defaultValue={initialAddress.zip}
              />
            </Field>
          </div>

          {/* Notificación de resultado */}
          {state && showBanner && (
            <div
              className={`mt-6 p-3.5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                state.ok
                  ? "bg-forest/10 text-forest"
                  : "bg-danger/10 text-danger"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  state.ok ? "bg-forest/20" : "bg-danger/20"
                }`}
              >
                <Icon name={state.ok ? "sparkle" : "alert"} size={18} />
              </div>
              <span className="text-sm font-semibold">
                {state.ok ? "¡Perfil actualizado con éxito!" : state.error}
              </span>
            </div>
          )}
        </Card>

        <div className="fixed bottom-[74px] lgx:bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-[12px] border-t border-line p-4 z-[45] lgx:!static lgx:!bg-transparent lgx:!border-t-0 lgx:!px-7 lgx:!pb-8 lgx:!pt-0">
          <div className="flex gap-2.5 max-w-[760px] mx-auto max-[420px]:flex-col lgx:pt-[18px] lgx:border-t lgx:border-line">
            <Button
              full
              type="submit"
              variant="accent"
              icon={isPending ? undefined : "check"}
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
            <SignOutButton>
              <Button full variant="danger" icon="logout" disabled={isPending}>
                Cerrar sesión
              </Button>
            </SignOutButton>
          </div>
        </div>
      </form>
    </div>
  );
}
