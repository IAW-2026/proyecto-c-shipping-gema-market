import { getAuthContext } from "./context";
import { getInternalUserId } from "./get-internal-user-id";

export async function getAuthenticatedUserId() {
    const { clerkUserId } = await getAuthContext();
    if (!clerkUserId) return null;
    return getInternalUserId(clerkUserId);
}
