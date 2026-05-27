import { headers } from "next/headers";

export async function getAuthContext() {
    const h = await headers();
    return {
        clerkUserId: h.get("x-clerk-user-id"),
        role: h.get("x-user-role"),
    };
}
