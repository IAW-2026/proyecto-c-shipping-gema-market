"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import type { Usuario } from "@prisma/client";
import { Card, Field, Input, Button, Icon } from "@/app/components/ui";
import type { Address } from "@/app/lib/types/user";
import { updateUsuarioAdminAction } from "@/app/lib/actions/admin/users";
import { DeleteUsuarioButton } from "./DeleteUserButton";

interface UsuarioFormProps {
  usuario: Usuario;
}

export function UsuarioForm({ usuario }: UsuarioFormProps) {
  // .bind pre-aplica usuario.id como primer arg de la server action.
  // useActionState llamará a action(prevState, formData) y en el server
  // se ejecuta updateUsuarioAdminAction(usuario.id, prevState, formData).
  // No se puede usar un arrow function: rompe la referencia RPC a la server action.
  const action = updateUsuarioAdminAction.bind(null, usuario.id);
  const [state, formAction, isPending] = useActionState(action, null);

  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!state) return;
    // Se envuelve en un setTimeout para que el banner aparezca después de
    // que el DOM se actualice con el nuevo estado. Sino state cambia a null
    // justo después de la acción, y el banner no alcanza a renderizarse con
    // el mensaje de éxito o error.
    const showTimer = setTimeout(() => setShowBanner(true), 0);
    const hideTimer = setTimeout(() => setShowBanner(false), 3500);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [state]);

  const initialAddress = (usuario.address as unknown as Address) || {
    street: "",
    number: "",
    zip: "",
  };

  return (
    <form action={formAction}>
      <Card padding={20} className="mb-4">
        <div className="flex items-center gap-2.5 mb-[18px]">
          <div className="w-9 h-9 rounded-xl bg-bone flex items-center justify-center text-olive">
            <Icon name="user" size={18} />
          </div>
          <div>
            <h2 className="m-0 text-[17px] font-bold">Editar usuario</h2>
            <div className="text-xs text-ink-3 font-mono [overflow-wrap:anywhere]">
              {usuario.id}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 lgx:grid-cols-2 lgx:gap-4">
          <Field label="Nombre completo">
            <Input
              name="fullName"
              icon="user"
              defaultValue={usuario.fullName ?? ""}
            />
          </Field>
          <Field label="Email">
            <Input
              name="email"
              icon="mail"
              type="email"
              defaultValue={usuario.email ?? ""}
            />
          </Field>
          <Field label="Teléfono">
            <Input
              name="phoneNumber"
              icon="phone"
              defaultValue={usuario.phoneNumber ?? ""}
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
            <Input name="number" defaultValue={initialAddress.number} />
          </Field>
          <Field label="Código postal">
            <Input name="zip" defaultValue={initialAddress.zip} />
          </Field>
        </div>

        {state && showBanner && (
          <div
            className={`mt-6 p-3.5 rounded-2xl flex items-center gap-3 ${
              state.ok ? "bg-forest/10 text-forest" : "bg-danger/10 text-danger"
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
              {state.ok ? "Cambios guardados." : state.error}
            </span>
          </div>
        )}
      </Card>

      <div className="flex flex-wrap gap-2.5 justify-between">
        <div className="flex gap-2.5">
          <Link href="/admin/users">
            <Button variant="secondary" icon="arrowLeft">
              Volver
            </Button>
          </Link>
          <Button
            type="submit"
            variant="accent"
            icon={isPending ? undefined : "check"}
            disabled={isPending}
          >
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        </div>
        <DeleteUsuarioButton id={usuario.id} disabled={isPending} />
      </div>
    </form>
  );
}
