"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@/app/components/ui";
import { deleteUsuarioAdminAction } from "@/app/lib/actions/admin/users";

interface Props {
  id: string;
  disabled?: boolean;
}

export function DeleteUsuarioButton({ id, disabled }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    setShowConfirm(false);
    setError(null);
    startTransition(async () => {
      const result = await deleteUsuarioAdminAction(id);
      if (result.ok) {
        router.push("/admin/users");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col items-end gap-1.5">
        <Button
          variant="danger"
          icon="trash"
          onClick={() => setShowConfirm(true)}
          disabled={disabled || isPending}
        >
          {isPending ? "Eliminando..." : "Eliminar"}
        </Button>
        {error && (
          <span className="text-xs text-danger max-w-[280px] text-right">
            {error}
          </span>
        )}
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4"
          style={{ background: "rgba(28,29,24,0.45)" }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-paper rounded-r2 shadow-sh-3 w-full max-w-sm p-6 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-bone flex items-center justify-center">
                <Icon name="trash" size={18} className="text-danger" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[15px] font-semibold text-ink leading-snug">
                  ¿Eliminar usuario?
                </span>
                <span className="text-sm text-ink-3 leading-relaxed">
                  Esta acción no se puede deshacer. El usuario será eliminado
                  permanentemente.
                </span>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirm}>
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
