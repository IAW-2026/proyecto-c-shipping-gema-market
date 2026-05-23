import Link from "next/link";
import { Icon, IconName } from "@/app/components/ui";

const ADMIN_SECTIONS: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Inicio", icon: "home" },
  { href: "/admin/users", label: "Usuarios", icon: "user" },
  { href: "/admin/orders", label: "Órdenes", icon: "box" },
];

// Layout síncrono para mantener el shell estático bajo PPR (cacheComponents).
// La autorización real la garantiza el middleware en proxy.ts; cada page
// además llama a requireAdmin() dentro del async content como defensa en profundidad.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream lgx:pt-8 lgx:px-7 lgx:pb-32">
      <div className="max-w-[1100px] mx-auto p-4 lgx:p-0">
        <header className="mb-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3 mb-1.5">
            Panel
          </div>
          <h1 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-ink">
            Administración
          </h1>
        </header>

        <nav className="mb-6 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {ADMIN_SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="inline-flex shrink-0 items-center gap-2 px-3.5 h-[34px] rounded-full text-[13px] font-medium bg-paper border border-line-2 text-ink hover:border-olive transition-colors"
            >
              <Icon name={s.icon} size={16} />
              {s.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
