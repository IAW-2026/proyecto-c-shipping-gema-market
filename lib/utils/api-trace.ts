export type TraceEntry = {
    timestamp: string;
    target: string;
    method: string;
    url: string;
    request_body?: unknown;
    response_status: number;
    response_body?: unknown;
};

export class ApiTrace {
    private entries: TraceEntry[] = [];

    add(entry: Omit<TraceEntry, "timestamp">): void {
        this.entries.push({ ...entry, timestamp: new Date().toISOString() });
    }

    getAll(): TraceEntry[] {
        return this.entries;
    }

    clear(): void {
        this.entries = [];
    }
}
