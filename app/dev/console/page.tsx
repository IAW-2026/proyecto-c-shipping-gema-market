import { NotificationFeed } from "../_components/notification-feed";

export default function ConsolePage() {
    return (
        <div className="p-6">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-ink">Consola de Notificaciones</h1>
                <p className="text-base text-ink-2 mt-1">
                    Mensajes enviados a Seller API, Buyer API y llamadas internas en tiempo real.
                </p>
            </div>
            <div className="bg-gray-950 rounded-r3 p-1 border border-gray-600 shadow-xl">
                <NotificationFeed />
            </div>
        </div>
    );
}
