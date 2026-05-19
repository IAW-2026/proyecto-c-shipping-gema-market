import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { UnauthorizedContent } from "./_components/UnauthorizedContent";

export default async function UnauthorizedPage() {
    const { userId } = await auth();

    if (userId) {
        try {
            const client = await clerkClient();
            const user = await client.users.getUser(userId);
            const role = user.publicMetadata?.role as string | undefined;

            if (role === "logistics") {
                redirect("/dashboard");
            }
            if (role === "admin_logistics") {
                redirect("/admin/dashboard");
            }
        } catch {
            // Error al obtener usuario de Clerk, mostrar página normalmente
        }
    }

    return <UnauthorizedContent />;
}
