export type NotificationTarget = "SELLER" | "BUYER" | "API";

export interface NotificationEntry {
    id: string;
    timestamp: string;
    target: NotificationTarget;
    method: string;
    url: string;
    body?: Record<string, unknown>;
    status: number;
    response?: Record<string, unknown>;
    transition?: string;
}

const STORAGE_KEY = "__opencode_notifications_registry";
const MAX_ENTRIES = 500;

function getStore(): NotificationEntry[] {
    const g = globalThis as { [STORAGE_KEY]?: NotificationEntry[] };
    if (!g[STORAGE_KEY]) {
        g[STORAGE_KEY] = [];
    }
    return g[STORAGE_KEY]!;
}

class NotificationRegistry {
    add(entry: Omit<NotificationEntry, "id" | "timestamp">): NotificationEntry {
        const store = getStore();
        const newEntry: NotificationEntry = {
            ...entry,
            id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            timestamp: new Date().toLocaleTimeString("es-AR", { hour12: false, timeZone: "America/Argentina/Buenos_Aires" }),
        };

        store.unshift(newEntry);

        if (store.length > MAX_ENTRIES) {
            store.length = MAX_ENTRIES;
        }

        return newEntry;
    }

    getAll(): NotificationEntry[] {
        return [...getStore()];
    }

    getByTarget(target: NotificationTarget): NotificationEntry[] {
        return getStore().filter((e) => e.target === target);
    }

    clear(): void {
        getStore().length = 0;
    }
}

export const notificationRegistry = new NotificationRegistry();
