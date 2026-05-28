import { auth } from "@clerk/nextjs/server";
import { getInternalUserId } from "./get-internal-user-id";

export async function getAuthenticatedUserId() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;
    return getInternalUserId(clerkUserId);
}
