import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Lee el rol del usuario actual desde sessionClaims.metadata.role.
 * El claim viene del JWT template configurado en Clerk Dashboard que expone
 * `user.public_metadata` como `metadata` en los session claims.
 *
 * Memoizado con React.cache(): una sola ejecución por render server.
 */
export const isAdmin = cache(async (): Promise<boolean> => {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin_buyer";
});

/**
 * Guard para server components, server actions y route handlers.
 * Redirige a "/" si el usuario actual no es admin.
 *
 * El middleware (proxy.ts) ya protege /admin/* a nivel de routing,
 * pero esta función agrega defensa en profundidad para server actions
 * que pueden ser invocadas desde cualquier origen.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/");
}
