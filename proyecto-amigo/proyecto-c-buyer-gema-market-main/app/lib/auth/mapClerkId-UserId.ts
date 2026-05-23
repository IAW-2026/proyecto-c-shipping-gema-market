import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { generateUlid } from "@/app/lib/utils/ulidGenerator";

/**
 * Retorna el ID interno (BD) del usuario autenticado actualmente.
 *
 * Lazy sync: si el usuario existe en Clerk pero todavía no tiene fila en
 * `Usuario`, la crea en la primera request que necesite su id interno.
 *
 * Race-safety: el `findUnique` + `create` no es atómico — entre los dos
 * queries puede entrar otra request paralela (típico con prefetch de Next.js
 * justo después del signup). Si eso pasa, `create` falla con P2002 y
 * refetcheamos para devolver la fila que creó la otra request.
 *
 * Memoizado con `React.cache()`: una sola ejecución por render server.
 */
export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const clerkUser = await currentUser();
  if (!clerkUser?.id) return null;

  const existing = await prisma.usuario.findUnique({
    where: { clerkUserId: clerkUser.id },
    select: { id: true },
  });
  if (existing) return existing.id;

  try {
    const created = await prisma.usuario.create({
      data: {
        id: generateUlid("usr_"),
        clerkUserId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
        fullName:
          [clerkUser.firstName, clerkUser.lastName]
            .filter(Boolean)
            .join(" ") || "",
      },
      select: { id: true },
    });
    return created.id;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const refetched = await prisma.usuario.findUnique({
        where: { clerkUserId: clerkUser.id },
        select: { id: true },
      });
      return refetched?.id ?? null;
    }
    console.error("[getCurrentUserId] Lazy sync failed:", error);
    return null;
  }
});
