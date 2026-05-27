import { getActiveShipments } from "@/lib/db/queries/dashboard";
import { getAuthContext } from "@/lib/auth/context";
import { getInternalUserId } from "@/lib/auth/get-internal-user-id";
import { ActiveShipmentsList } from "./active-shipments-list";

export async function ActiveShipmentsData() {
    const { clerkUserId } = await getAuthContext();
    if (!clerkUserId) return null;
    const user = await getInternalUserId(clerkUserId);
    if (!user) return null;
    const shipments = await getActiveShipments(user.id);
    return <ActiveShipmentsList shipments={shipments} />;
}
