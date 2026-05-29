import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getInternalUserId } from "./get-internal-user-id";

export async function getAuthenticatedUserId() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;
    return getInternalUserId(clerkUserId);
}

export async function requireAuthenticatedUser() {
    const user = await getAuthenticatedUserId();
    if (!user) redirect("/sign-in");
    return user;
}
