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

const MAX_ENTRIES = 500;

class NotificationRegistry {
    private entries: NotificationEntry[] = [];
    private idCounter = 0;

    add(entry: Omit<NotificationEntry, "id" | "timestamp">): NotificationEntry {
        const newEntry: NotificationEntry = {
            ...entry,
            id: `notif_${++this.idCounter}`,
            timestamp: new Date().toLocaleTimeString("es-AR", { hour12: false }),
        };

        this.entries.unshift(newEntry);

        if (this.entries.length > MAX_ENTRIES) {
            this.entries = this.entries.slice(0, MAX_ENTRIES);
        }

        return newEntry;
    }

    getAll(): NotificationEntry[] {
        return [...this.entries];
    }

    getByTarget(target: NotificationTarget): NotificationEntry[] {
        return this.entries.filter((e) => e.target === target);
    }

    clear(): void {
        this.entries = [];
    }
}

export const notificationRegistry = new NotificationRegistry();
