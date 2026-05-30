import { Database, TerminalSquare, Terminal, Users, BarChart3, Package, Truck, History, Clock, Repeat, Globe, Gamepad2, Radio, ArrowRight } from "lucide-react";
import { TestingChecklist } from "./_components/testing-checklist";

const PAGES_INFO = [
    {
        name: "Seed",
        route: "/dev/seed",
        icon: Database,
        description: "Explorador de base de datos. Selecciona una tabla del dropdown para ver su contenido real con todas las columnas y filas. Usa el boton Refresh para actualizar inmediatamente.",
    },
    {
        name: "API Playground",
        route: "/dev/playground",
        icon: TerminalSquare,
        description: "Simula el flujo completo de integracion: cotizar un envio, reservar la cotizacion, crear el envio. Configura direcciones de origen/destino, dimensiones del paquete y datos del comprador. Visualiza el trafico entre aplicaciones en el log lateral.",
    },
    {
        name: "Consola",
        route: "/dev/console",
        icon: Terminal,
        description: "Visualiza en tiempo real todas las notificaciones enviadas a la Seller API y Buyer API, como tambien las llamadas internas para obtener datos del comprador y direccion del vendedor. Filtra por tipo y limpia la consola cuando necesites.",
    },
];

const SEED_ITEMS = [
    { label: "Usuarios nuevos", detail: "2 (1 baneado + 1 eliminable)", icon: Users },
    { label: "Tarifas", detail: "5 rangos de peso", icon: BarChart3 },
    { label: "Entregas HOY (repartidor principal)", detail: "3 envios entregados", icon: Package },
    { label: "Envios activos (repartidor principal)", detail: "4 (1 pending_pickup, 1 picked_up, 2 in_transit)", icon: Truck },
    { label: "Historicos (repartidor principal)", detail: "~23 distribuidos en 6 semanas", icon: History },
    { label: "Sin asignar (waiting_for_courier)", detail: "~10 envios disponibles", icon: Clock },
    { label: "Envios drivers secundarios", detail: "~9 entregas historicas", icon: Users },
];

const DETAIL_TEXT = `Cada envio incluye coordenadas reales de Bahia Blanca obtenidas via Nominatim, destinatarios con nombres argentinos y telefonos 291xxxxxxx, pesos y dimensiones variados segun las tarifas vigentes. Las fechas son relativas al momento de ejecucion, por lo que el dashboard, rendimiento semanal y liquidaciones siempre muestran datos actualizados. No se crean cotizaciones con el seed, solo envios directos.`;

export default function DevIntroPage() {
    return (
        <div className="p-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-ink">Dev Center</h1>
                    <p className="text-base text-ink-2 mt-1">
                        Herramientas de desarrollo y testing para el sistema de shipping de UniHousing.
                    </p>
                </div>

                {/* Que es el Dev Center */}
                <div className="bg-paper border border-line rounded-r3 overflow-hidden">
                    <div className="px-5 py-4 border-b border-line">
                        <h3 className="text-base font-semibold text-ink">Que es el Dev Center</h3>
                    </div>
                    <div className="p-5">
                        <p className="text-base text-ink-2 leading-relaxed">
                            El Dev Center centraliza todas las herramientas necesarias para probar y demostrar las funcionalidades del sistema de logistica. Desde aca podes seedear la base de datos con datos realistas, explorar el contenido de cada tabla, simular el flujo completo de creacion de envios y monitorear las notificaciones entre servicios en tiempo real.
                        </p>
                    </div>
                </div>

                {/* Seed de Base de Datos */}
                <div className="bg-paper border border-line rounded-r3 overflow-hidden">
                    <div className="px-5 py-4 border-b border-line">
                        <h3 className="text-base font-semibold text-ink">Seed de Base de Datos</h3>
                    </div>
                    <div className="p-5 space-y-4">
                        <p className="text-base text-ink-2">
                            El seed crea datos con fechas relativas al momento de ejecucion, por lo que siempre estan actualizados para el dashboard, rendimiento semanal y liquidaciones.
                        </p>
                        <ul className="space-y-3">
                            {SEED_ITEMS.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.label} className="flex items-start gap-3">
                                        <Icon size={20} className="shrink-0 mt-0.5 text-ink-3" />
                                        <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                            <span className="text-base font-medium text-ink">{item.label}</span>
                                            <span className="text-base text-ink-3">{item.detail}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="bg-bone/50 border border-line rounded-r2 p-4">
                            <p className="text-sm text-ink-2 leading-relaxed">{DETAIL_TEXT}</p>
                        </div>
                    </div>
                </div>

                {/* Paginas disponibles */}
                <div className="bg-paper border border-line rounded-r3 overflow-hidden">
                    <div className="px-5 py-4 border-b border-line">
                        <h3 className="text-base font-semibold text-ink">Paginas disponibles</h3>
                    </div>
                    <div className="divide-y divide-line">
                        {PAGES_INFO.map((page) => {
                            const Icon = page.icon;
                            return (
                                <div key={page.route} className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon size={20} className="text-ink-3" />
                                        <span className="text-base font-semibold text-ink">{page.name}</span>
                                    </div>
                                    <p className="text-base text-ink-2 leading-relaxed">{page.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Flujos de Testing */}
                <TestingChecklist />
            </div>
        </div>
    );
}
