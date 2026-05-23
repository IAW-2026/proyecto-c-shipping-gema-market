import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/app/components/ui";
import { requireAdmin } from "@/app/lib/auth/roles";
import { getUsuarioById } from "@/app/lib/db/user";
import { UsuarioForm } from "../_components/UserForm";
import { UsuarioFormSkeleton } from "../_components/UserFormSkeleton";

async function UsuarioDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const usuario = await getUsuarioById(id);
  if (!usuario) notFound();

  return (
    <>
      <SectionTitle eyebrow="Usuario">
        {usuario.fullName || usuario.email}
      </SectionTitle>
      <UsuarioForm usuario={usuario} />
    </>
  );
}

export default function AdminUsuarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<UsuarioDetailSkeleton />}>
      <UsuarioDetailContent params={params} />
    </Suspense>
  );
}

function UsuarioDetailSkeleton() {
  return (
    <>
      <SectionTitle eyebrow="Usuario">Cargando…</SectionTitle>
      <UsuarioFormSkeleton />
    </>
  );
}
