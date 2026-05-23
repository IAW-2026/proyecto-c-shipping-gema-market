import { Usuario } from "@prisma/client";
import { getCurrentUserId } from "@/app/lib/auth/mapClerkId-UserId";
import { getUsuarioById } from "@/app/lib/db/user";

/**
 * Obtiene el usuario actual directamente del esquema de la base de datos.
 */
export async function getAccountData(): Promise<Usuario | null> {
  const userId = await getCurrentUserId();

  try {
    if (!userId) return null;
    return await getUsuarioById(userId);
  } catch (error) {
    console.error("Error fetching account data:", error);
    return null;
  }
}
