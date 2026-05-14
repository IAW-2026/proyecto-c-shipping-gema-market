import { NextRequest } from "next/server";
import { ApiTrace } from "./api-trace";

export function createTraceIfDebug(request: NextRequest): ApiTrace | undefined {
    if (request.headers.get("X-Debug") === "true") {
        return new ApiTrace();
    }
    return undefined;
}

export function withTrace<T>(
    data: T,
    trace: ApiTrace | undefined
): T & { _trace?: unknown[] } {
    if (trace && trace.getAll().length > 0) {
        return { ...data, _trace: trace.getAll() } as T & { _trace?: unknown[] };
    }
    return data as T & { _trace?: unknown[] };
}
