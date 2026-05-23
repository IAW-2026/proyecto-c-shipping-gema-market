import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { UnauthorizedContent } from "./_components/UnauthorizedContent";

export default async function UnauthorizedPage() {
    const clerkUser = await currentUser();

    if (clerkUser) {
        const role = clerkUser.publicMetadata?.role as string | undefined;

        if (role === "logistics") {
            redirect("/dashboard");
        }
        if (role === "admin_logistics") {
            redirect("/admin/dashboard");
        }
    }

    return <UnauthorizedContent />;
}
