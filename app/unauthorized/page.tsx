import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UnauthorizedContent } from "./_components/UnauthorizedContent";

export default async function UnauthorizedPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    return <UnauthorizedContent />;
}
