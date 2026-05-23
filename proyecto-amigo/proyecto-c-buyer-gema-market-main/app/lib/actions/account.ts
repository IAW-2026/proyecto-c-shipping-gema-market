"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/app/lib/auth/mapClerkId-UserId";
import { updateUsuario } from "@/app/lib/db/user";
import { AccountSchema } from "@/app/lib/schemas/account";

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

/**
 * Server Action para actualizar los datos del usuario.
 * Acepta FormData directamente para uso con useActionState sin wrapper intermedio.
 */
export async function updateAccountAction(
  _prevState: unknown,
  formData: FormData,
) {
  const data = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    address: {
      street: formData.get("street"),
      number: formData.get("number"),
      zip: formData.get("zip"),
    },
  };

  // 1. Validar con Zod
  const parsed = AccountSchema.safeParse(data);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      ok: false,
      error: firstIssue?.message ?? "Datos inválidos.",
    };
  }

  // 2. Obtener usuario autenticado
  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false, error: "No autenticado." };
  }

  // 3. Persistir
  try {
    await updateUsuario(userId, parsed.data);
    revalidatePath("/account");
    return { ok: true };
  } catch (error) {
    console.error("Error updating account:", error);
    return {
      ok: false,
      error: "No se pudieron guardar los cambios en el servidor.",
    };
  }
}
