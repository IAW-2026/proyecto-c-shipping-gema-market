export function logIncomingRequest(endpoint: string, method: string, body: unknown) {
    console.log(`→ ${method} ${endpoint}`);
    if (body) console.log("  Body:", JSON.stringify(body).slice(0, 1000));
}

export function logIncomingResponse(endpoint: string, status: number, body: unknown, durationMs: number) {
    console.log(`← ${status} ${endpoint} (${durationMs}ms)`);
    if (body) console.log("  Response:", JSON.stringify(body).slice(0, 1000));
}

export function logOutgoingRequest(service: string, method: string, url: string) {
    console.log(`→ [${service}] ${method} ${url}`);
}

export function logOutgoingResponse(service: string, status: number, body: unknown) {
    console.log(`← [${service}] ${status}`);
    if (body) console.log("  Response:", JSON.stringify(body).slice(0, 500));
}
