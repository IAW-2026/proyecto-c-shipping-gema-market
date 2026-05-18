import { ROLES } from "@/lib/definitions/auth";
import { requireRole } from "@/lib/auth/rbac";

export default async function AdminDashboardPage() {
    const { userId } = await requireRole([ROLES.ADMIN_LOGISTICS]);

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
            <h1 className="text-xl font-bold text-ink-3 mb-2">Panel de Administración</h1>
            <p className="text-ink-2 text-sm mb-8">
                Bienvenido al panel de administración. ID: {userId}
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-paper border border-line rounded-r2 p-5">
                    <h2 className="text-sm font-semibold text-ink-3 mb-1">Gestión de usuarios</h2>
                    <p className="text-xs text-ink-2">Próximamente</p>
                </div>
                <div className="bg-paper border border-line rounded-r2 p-5">
                    <h2 className="text-sm font-semibold text-ink-3 mb-1">Métricas globales</h2>
                    <p className="text-xs text-ink-2">Próximamente</p>
                </div>
                <div className="bg-paper border border-line rounded-r2 p-5">
                    <h2 className="text-sm font-semibold text-ink-3 mb-1">Configuración</h2>
                    <p className="text-xs text-ink-2">Próximamente</p>
                </div>
            </div>
        </div>
    );
}
