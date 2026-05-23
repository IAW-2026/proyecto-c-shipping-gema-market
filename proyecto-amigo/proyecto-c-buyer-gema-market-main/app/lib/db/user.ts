import { prisma } from "@/app/lib/prisma";
import { Usuario, Role } from "@prisma/client";
import type { Address } from "@/app/lib/types/user";

export type { Address };

type UpdateUsuarioInput = Partial<{
  email: string;
  fullName: string;
  phoneNumber: string;
  address: Address;
  role: Role;
}>;

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Busca un usuario por su ID interno
 * where: { id } → localiza el usuario único
 * Sin include: retorna solo el usuario, sin relaciones
 * Retorna: Usuario encontrado o null si no existe
 */
export async function getUsuarioById(id: string): Promise<Usuario | null> {
  return prisma.usuario.findUnique({
    where: { id },
  });
}

/**
 * Obtiene usuarios con paginación opcional, ordenados por fecha de creación (descendente).
 * Sin opciones: retorna todos los usuarios.
 * Con { skip, take }: retorna la página correspondiente.
 */
export async function getAllUsuarios(opts?: {
  skip?: number;
  take?: number;
  search?: string;
}): Promise<Usuario[]> {
  const where = opts?.search
    ? {
        OR: [
          { fullName: { contains: opts.search, mode: "insensitive" as const } },
          { email: { contains: opts.search, mode: "insensitive" as const } },
        ],
      }
    : undefined;
  return prisma.usuario.findMany({
    where,
    skip: opts?.skip,
    take: opts?.take,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Cuenta total de usuarios — útil para calcular páginas en listados paginados.
 */
export async function countUsuarios(search?: string): Promise<number> {
  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;
  return prisma.usuario.count({ where });
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

/**
 * Actualiza un usuario existente
 * where: { id } → localiza el usuario exacto
 * data: { email?, fullName?, address?, role? } → cambios parciales
 * Sin include: retorna solo el usuario actualizado
 * Retorna: Usuario modificado con cambios aplicados
 */
export async function updateUsuario(
  id: string,
  data: UpdateUsuarioInput,
): Promise<Usuario> {
  return prisma.usuario.update({
    where: { id },
    data,
  });
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Elimina un usuario del sistema
 * where: { id } → localiza el usuario exacto
 * delete: borra el registro
 * Sin include: retorna solo el usuario eliminado
 * Retorna: Usuario que fue eliminado
 */
export async function deleteUsuario(id: string): Promise<Usuario> {
  return prisma.usuario.delete({
    where: { id },
  });
}

// ─────────────────────────────────────────────
// HELPER - Cast JSON address field
// ─────────────────────────────────────────────
// Nota: el doble cast as unknown as Address es necesario porque
// Prisma tipea el campo Json? como Prisma.JsonValue, y no hay
// forma de hacer la conversión directamente sin él.

/**
 * Convierte el campo JSON 'address' de Usuario a tipo Address
 * Necesario porque Prisma tipea campos JSON como Prisma.JsonValue
 * Validación: si address es null/undefined, retorna null
 * Retorna: Address tipado correctamente o null
 */
export function parseAddress(usuario: Usuario): Address | null {
  if (!usuario.address) return null;
  return usuario.address as unknown as Address;
}
