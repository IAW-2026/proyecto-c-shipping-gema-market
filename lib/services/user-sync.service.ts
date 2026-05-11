import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';
import { generatePrefixedId, isNextDynamicServerError } from '@/lib/shared/utils';

export async function syncCurrentUser(): Promise<void> {
  try {
    const user = await currentUser();
    if (!user) {
      console.log(' [Sync] No hay sesión de Clerk activa.');
      return;
    }

    console.log(` [Sync] Sincronizando usuario: ${user.id}`);

    const clerk_user_id = user.id;
    const email = user.emailAddresses?.[0]?.emailAddress ?? '';
    const full_name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    const role =
      Array.isArray(user.publicMetadata.roles) && user.publicMetadata.roles.length > 0
        ? user.publicMetadata.roles.join(',')
        : 'logistics';

    await prisma.usuario.upsert({
      where: { clerk_user_id },
      update: { email, full_name, role },
      create: {
        id: generatePrefixedId('usr'),
        clerk_user_id,
        email,
        full_name,
        role,
      },
    });
    console.log(` [Sync] Usuario ${user.id} sincronizado con éxito.`);
  } catch (error) {
    // No atrapar la señal interna de Next.js — debe propagarse para que
    // el framework convierta la ruta a renderizado dinámico automáticamente
    if (isNextDynamicServerError(error)) {
      throw error;
    }
    console.error(' [Sync] Error al sincronizar usuario:', error);
    // Silent fail — database errors shouldn't break page loads
  }
}
