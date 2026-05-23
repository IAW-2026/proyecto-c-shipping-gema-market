"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/app/lib/auth/roles";
import { updateUsuario, deleteUsuario } from "@/app/lib/db/user";
import { AdminUsuarioUpdateSchema } from "@/app/lib/schemas/admin/usuario";

type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Actualiza nombre, email y teléfono de un usuario desde el panel admin.
 * No edita el campo `role` de la DB — el rol vive en Clerk metadata.
 */
export async function updateUsuarioAdminAction(
  id: string,
  _prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const data = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber") ?? "",
    address: {
      street: formData.get("street") ?? "",
      number: formData.get("number") ?? "",
      zip: formData.get("zip") ?? "",
    },
  };

  const parsed = AdminUsuarioUpdateSchema.safeParse(data);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { ok: false, error: firstIssue?.message ?? "Datos inválidos." };
  }

  try {
    await updateUsuario(id, parsed.data);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return { ok: true };
  } catch (error) {
    console.error("[updateUsuarioAdminAction] failed:", error);
    return { ok: false, error: "No se pudieron guardar los cambios." };
  }
}

/**
 * Elimina un usuario. Falla si tiene órdenes, carrito o favoritos por FK
 * — ese caso se aborda cuando se implementen los ABM de esas entidades.
 */
export async function deleteUsuarioAdminAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await deleteUsuario(id);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        ok: false,
        error:
          "No se puede eliminar: el usuario tiene órdenes, carrito o favoritos asociados.",
      };
    }
    console.error("[deleteUsuarioAdminAction] failed:", error);
    return { ok: false, error: "No se pudo eliminar el usuario." };
  }
}
