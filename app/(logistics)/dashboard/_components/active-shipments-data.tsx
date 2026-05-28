import { getActiveShipments } from "@/lib/db/queries/logistics/dashboard";
import { getAuthenticatedUserId } from "@/lib/auth/get-authenticated-user";
import { ActiveShipmentsList } from "./active-shipments-list";

export async function ActiveShipmentsData() {
    const user = await getAuthenticatedUserId();
    if (!user) return null;
    const shipments = await getActiveShipments(user.id);
    return <ActiveShipmentsList shipments={shipments} />;
}
