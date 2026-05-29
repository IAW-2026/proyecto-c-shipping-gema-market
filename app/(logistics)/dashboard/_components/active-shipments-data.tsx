import { getActiveShipments } from "@/lib/db/queries/logistics/dashboard";
import { requireAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { ActiveShipmentsList } from "./active-shipments-list";

export async function ActiveShipmentsData() {
    const user = await requireAuthenticatedUser();
    const shipments = await getActiveShipments(user.id);
    return <ActiveShipmentsList shipments={shipments} />;
}
